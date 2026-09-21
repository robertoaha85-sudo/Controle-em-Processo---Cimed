import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Maquina, LoteHistorico } from '../types';
import { MAQUINAS_INICIAIS } from '../initialData';

const CACHE_MAQUINAS_KEY = 'cimed_maquinas_realtime_cache_v1';
const CACHE_HISTORICO_KEY = 'cimed_historico_realtime_cache_v1';
const MAQUINAS_COLLECTION = 'maquinas';
const HISTORICO_COLLECTION = 'historico';

// Remove valores undefined para compatibilidade com o Firestore
function sanitizarParaFirestore(obj: Record<string, any>): Record<string, any> {
  const limpo: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) {
      limpo[k] = null;
    } else if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
      limpo[k] = sanitizarParaFirestore(v);
    } else {
      limpo[k] = v;
    }
  }
  return limpo;
}

// Ordem canônica das máquinas para manter a visualização idêntica em todos os monitores
const ORDEM_CANONICA_MAQUINAS = MAQUINAS_INICIAIS.map((m) => m.id);

function ordenarMaquinas(lista: Maquina[]): Maquina[] {
  return [...lista].sort((a, b) => {
    const idxA = ORDEM_CANONICA_MAQUINAS.indexOf(a.id);
    const idxB = ORDEM_CANONICA_MAQUINAS.indexOf(b.id);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.nome.localeCompare(b.nome);
  });
}

// Obter máquinas do cache local imediato
export function obterMaquinasLocais(): Maquina[] {
  try {
    const raw = localStorage.getItem(CACHE_MAQUINAS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return ordenarMaquinas(parsed);
      }
    }
  } catch (e) {
    console.warn('Erro ao ler máquinas do cache local:', e);
  }
  return MAQUINAS_INICIAIS;
}

export function salvarMaquinasLocais(maquinas: Maquina[]) {
  try {
    localStorage.setItem(CACHE_MAQUINAS_KEY, JSON.stringify(maquinas));
  } catch (e) {
    console.warn('Erro ao salvar máquinas no cache local:', e);
  }
}

// Obter histórico do cache local imediato
export function obterHistoricoLocal(): LoteHistorico[] {
  try {
    const raw = localStorage.getItem(CACHE_HISTORICO_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Erro ao ler histórico do cache local:', e);
  }
  return [];
}

export function salvarHistoricoLocal(historico: LoteHistorico[]) {
  try {
    localStorage.setItem(CACHE_HISTORICO_KEY, JSON.stringify(historico));
  } catch (e) {
    console.warn('Erro ao salvar histórico no cache local:', e);
  }
}

/**
 * Escuta as máquinas no Firestore em tempo real.
 * Qualquer alteração realizada por qualquer usuário (no chão de fábrica ou pelo gestor)
 * é distribuída instantaneamente para todos os dispositivos conectados.
 */
export function ouvirMaquinasEmTempoReal(
  onUpdate: (maquinas: Maquina[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    const colRef = collection(db, MAQUINAS_COLLECTION);

    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const maquinasCarregadas: Maquina[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            maquinasCarregadas.push({
              id: docSnap.id,
              nome: data.nome || docSnap.id,
              setor: data.setor || 'semissolidos',
              linhaPadrao: data.linhaPadrao || undefined,
              status: data.status || 'livre',
              produtoAtualId: data.produtoAtualId || null,
              produtoAtualCodigo: data.produtoAtualCodigo || null,
              produtoAtualNome: data.produtoAtualNome || null,
              numeroLote: data.numeroLote || null,
              dataInicio: data.dataInicio || null,
              horaInicio: data.horaInicio || null,
              previsaoTermino: data.previsaoTermino || null,
              tempoEnvaseMinutos: data.tempoEnvaseMinutos ?? null,
              teveProblemaMecanico: Boolean(data.teveProblemaMecanico),
              ultimaAtualizacao: data.ultimaAtualizacao || new Date().toISOString(),
              detalheProblema: data.detalheProblema || null,
              isBloqueio: Boolean(data.isBloqueio),
              loteBloqueioId: data.loteBloqueioId || null,
            });
          });

          // Garante que todas as 9 máquinas padrão existam
          const idsExistentes = new Set(maquinasCarregadas.map((m) => m.id));
          MAQUINAS_INICIAIS.forEach((padrao) => {
            if (!idsExistentes.has(padrao.id)) {
              maquinasCarregadas.push(padrao);
              // Cadastra no Firestore em background
              setDoc(doc(db, MAQUINAS_COLLECTION, padrao.id), sanitizarParaFirestore(padrao)).catch(() => {});
            }
          });

          const ordenadas = ordenarMaquinas(maquinasCarregadas);
          salvarMaquinasLocais(ordenadas);
          onUpdate(ordenadas);
        } else {
          // Coleção ainda vazia: inicializa automaticamente com as máquinas padrão da CIMED
          console.info('Inicializando coleção de máquinas no Firestore com dados padrão...');
          MAQUINAS_INICIAIS.forEach((padrao) => {
            setDoc(doc(db, MAQUINAS_COLLECTION, padrao.id), sanitizarParaFirestore(padrao)).catch(console.warn);
          });
          salvarMaquinasLocais(MAQUINAS_INICIAIS);
          onUpdate(MAQUINAS_INICIAIS);
        }
      },
      (error) => {
        console.warn('Firestore Maquinas onSnapshot erro (usando cache):', error);
        onUpdate(obterMaquinasLocais());
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Erro ao conectar listener Firestore para máquinas:', err);
    onUpdate(obterMaquinasLocais());
    return () => {};
  }
}

/**
 * Atualiza uma máquina no Firestore em tempo real.
 * Transmite a alteração para todos os gestores e operadores instantaneamente.
 */
export async function atualizarMaquinaFirestore(
  maquinaId: string,
  updates: Partial<Maquina>
): Promise<void> {
  const dadosLimpos = sanitizarParaFirestore({
    ...updates,
    ultimaAtualizacao: new Date().toISOString(),
  });

  try {
    const docRef = doc(db, MAQUINAS_COLLECTION, maquinaId);
    await setDoc(docRef, dadosLimpos, { merge: true });
  } catch (err) {
    console.warn(`Falha ao sincronizar máquina ${maquinaId} no Firestore:`, err);
  }
}

/**
 * Escuta o histórico de lotes finalizados no Firestore em tempo real
 */
export function ouvirHistoricoEmTempoReal(
  onUpdate: (historico: LoteHistorico[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    const colRef = collection(db, HISTORICO_COLLECTION);
    const q = query(colRef, orderBy('dataFinalizacao', 'desc'), limit(100));

    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const lista: LoteHistorico[] = [];
          snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            lista.push({
              id: docSnap.id,
              maquinaId: d.maquinaId || '',
              maquinaNome: d.maquinaNome || '',
              setor: d.setor || 'semissolidos',
              produtoCodigo: d.produtoCodigo || null,
              produtoNome: d.produtoNome || '',
              numeroLote: d.numeroLote || '',
              dataInicio: d.dataInicio || '',
              horaInicio: d.horaInicio || '',
              horaTermino: d.horaTermino || '',
              duracaoMinutos: d.duracaoMinutos || 0,
              teveProblemaMecanico: Boolean(d.teveProblemaMecanico),
              dataFinalizacao: d.dataFinalizacao || '',
              observacao: d.observacao || '',
              isBloqueio: Boolean(d.isBloqueio),
            });
          });
          salvarHistoricoLocal(lista);
          onUpdate(lista);
        } else {
          onUpdate(obterHistoricoLocal());
        }
      },
      (error) => {
        console.warn('Firestore Historico onSnapshot erro (usando cache):', error);
        onUpdate(obterHistoricoLocal());
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Erro ao conectar listener Firestore para histórico:', err);
    onUpdate(obterHistoricoLocal());
    return () => {};
  }
}

/**
 * Adiciona um lote concluído ao histórico no Firestore
 */
export async function adicionarLoteHistoricoFirestore(lote: LoteHistorico): Promise<void> {
  try {
    const docRef = doc(db, HISTORICO_COLLECTION, lote.id);
    await setDoc(docRef, sanitizarParaFirestore(lote));
  } catch (err) {
    console.warn('Falha ao gravar histórico no Firestore:', err);
  }
}

/**
 * Exclui um lote do histórico no Firestore
 */
export async function excluirLoteHistoricoFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, HISTORICO_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn(`Falha ao excluir lote ${id} no Firestore:`, err);
  }
}

/**
 * Restaura todas as máquinas para os valores iniciais livres no Firestore
 */
export async function restaurarTodasMaquinasFirestore(): Promise<void> {
  try {
    for (const padrao of MAQUINAS_INICIAIS) {
      const docRef = doc(db, MAQUINAS_COLLECTION, padrao.id);
      await setDoc(docRef, sanitizarParaFirestore({
        ...padrao,
        ultimaAtualizacao: new Date().toISOString(),
      }));
    }
  } catch (err) {
    console.warn('Erro ao restaurar máquinas no Firestore:', err);
  }
}
