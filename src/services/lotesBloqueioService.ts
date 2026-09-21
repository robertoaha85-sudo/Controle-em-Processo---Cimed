import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LoteBloqueio } from '../types';

const LOCAL_STORAGE_KEY = 'cimed_lotes_bloqueio_v1';
const COLLECTION_NAME = 'lotesBloqueio';

export function obterLotesBloqueioLocais(): LoteBloqueio[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Remove quaisquer dados de teste/exemplos antigos
        const limpos = parsed.filter(
          (item: LoteBloqueio) =>
            item &&
            !String(item.id).startsWith('local-bloqueio-') &&
            item.numeroLote !== 'L24091' &&
            item.numeroLote !== 'L24089' &&
            item.numeroLote !== 'L24095'
        );
        return limpos;
      }
    }
  } catch (e) {
    console.warn('Erro ao ler lotes de bloqueio do localStorage:', e);
  }
  return [];
}

export function salvarLotesBloqueioLocais(lotes: LoteBloqueio[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lotes));
  } catch (e) {
    console.warn('Erro ao salvar lotes de bloqueio no localStorage:', e);
  }
}

/**
 * Escuta em tempo real os lotes de bloqueio no Firestore.
 * Conforme especificado, sincroniza com a coleção lotesBloqueio.
 * NUNCA adiciona lotes automaticamente: somente reflete ações do usuário.
 */
export function ouvirLotesBloqueio(
  onUpdate: (lotes: LoteBloqueio[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef, orderBy('criadoEm', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const lotes: LoteBloqueio[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            // Purga quaisquer exemplos de demonstração gerados anteriormente
            if (
              data.numeroLote === 'L24091' ||
              data.numeroLote === 'L24089' ||
              data.numeroLote === 'L24095'
            ) {
              deleteDoc(docSnap.ref).catch(() => {});
              return;
            }
            lotes.push({
              id: docSnap.id,
              produto: data.produto || '',
              codigoProduto: data.codigoProduto || null,
              numeroLote: data.numeroLote || '',
              maquina: data.maquina || '',
              setor: data.setor || undefined,
              prazo: data.prazo || 'hoje',
              dataLimite: data.dataLimite || '',
              status: data.status || 'pendente',
              observacoes: data.observacoes || '',
              criadoEm: data.criadoEm || new Date().toISOString(),
              concluidoEm: data.concluidoEm || null,
              iniciadoEm: data.iniciadoEm || null,
              maquinaEmUsoId: data.maquinaEmUsoId || null,
            });
          });
          salvarLotesBloqueioLocais(lotes);
          onUpdate(lotes);
        } else {
          // Coleção vazia: nenhum lote automático
          salvarLotesBloqueioLocais([]);
          onUpdate([]);
        }
      },
      (error) => {
        console.warn('Firestore Snapshot erro (usando fallback local):', error);
        const locais = obterLotesBloqueioLocais();
        onUpdate(locais);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.warn('Erro ao conectar ao Firestore:', error);
    const locais = obterLotesBloqueioLocais();
    onUpdate(locais);
    return () => {};
  }
}

/**
 * Cadastra novo lote de bloqueio no Firestore
 */
export async function cadastrarLoteBloqueio(
  dados: Omit<LoteBloqueio, 'id' | 'criadoEm' | 'status'> & {
    id?: string;
    criadoEm?: string;
    status?: LoteBloqueio['status'];
    iniciadoEm?: string | null;
    concluidoEm?: string | null;
    maquinaEmUsoId?: string | null;
  }
): Promise<string> {
  const agora = new Date().toISOString();
  const novo: Omit<LoteBloqueio, 'id'> = {
    produto: dados.produto,
    codigoProduto: dados.codigoProduto || null,
    numeroLote: dados.numeroLote.toUpperCase().trim(),
    maquina: dados.maquina,
    setor: dados.setor,
    prazo: dados.prazo,
    dataLimite: dados.dataLimite || agora.split('T')[0],
    status: dados.status || 'pendente',
    observacoes: dados.observacoes || '',
    criadoEm: dados.criadoEm || agora,
    concluidoEm: dados.concluidoEm !== undefined ? dados.concluidoEm : null,
    iniciadoEm: dados.iniciadoEm !== undefined ? dados.iniciadoEm : null,
    maquinaEmUsoId: dados.maquinaEmUsoId !== undefined ? dados.maquinaEmUsoId : null,
  };

  try {
    const colRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(colRef, novo);
    // Também sincroniza com cache local
    const lista = obterLotesBloqueioLocais();
    const idx = lista.findIndex((l) => l.id === docRef.id || l.numeroLote === novo.numeroLote);
    if (idx !== -1) {
      lista[idx] = { ...novo, id: docRef.id };
    } else {
      lista.unshift({ ...novo, id: docRef.id });
    }
    salvarLotesBloqueioLocais(lista);
    return docRef.id;
  } catch (err) {
    console.warn('Falha ao gravar no Firestore (fallback local):', err);
    const localId = dados.id || `bloqueio-${Date.now()}`;
    const lista = obterLotesBloqueioLocais();
    const idx = lista.findIndex((l) => l.id === localId || l.numeroLote === novo.numeroLote);
    if (idx !== -1) {
      lista[idx] = { ...novo, id: localId };
    } else {
      lista.unshift({ ...novo, id: localId });
    }
    salvarLotesBloqueioLocais(lista);
    return localId;
  }
}

/**
 * Atualiza um lote de bloqueio no Firestore
 */
export async function atualizarLoteBloqueio(
  id: string,
  updates: Partial<LoteBloqueio>
): Promise<void> {
  // Atualiza cache local imediatamente para consistência rápida
  const lista = obterLotesBloqueioLocais();
  const idx = lista.findIndex((l) => l.id === id);
  if (idx !== -1) {
    lista[idx] = { ...lista[idx], ...updates };
    salvarLotesBloqueioLocais(lista);
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updates);
  } catch (err) {
    console.warn('Falha ao atualizar no Firestore (mantido localmente):', err);
  }
}

/**
 * Marca como concluído um lote de bloqueio
 */
export async function concluirLoteBloqueio(id: string): Promise<void> {
  const agora = new Date().toISOString();
  await atualizarLoteBloqueio(id, {
    status: 'concluido',
    concluidoEm: agora,
  });
}

/**
 * Exclui um lote de bloqueio do Firestore
 */
export async function excluirLoteBloqueio(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Falha ao excluir no Firestore (fallback local):', err);
    const lista = obterLotesBloqueioLocais().filter((l) => l.id !== id);
    salvarLotesBloqueioLocais(lista);
  }
}
