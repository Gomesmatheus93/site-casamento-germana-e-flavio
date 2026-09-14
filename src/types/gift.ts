export type GiftStatus = "DISPONIVEL" | "RESERVADO" | "COMPRADO";

export type Gift = {
  id: string;
  nome: string;
  valor: number;
  categoria: string;
  status: GiftStatus;
  descricao: string | null;
  fotoUrl: string | null;
  linkExterno: string | null;
  createdAt: string;
  updatedAt: string;
};
