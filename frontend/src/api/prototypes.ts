import { api } from "./client";
import { Prototype } from "../types";

interface CreatePrototypePayload {
  title: string;
  description: string;
}

export async function fetchPrototypes(search?: string): Promise<Prototype[]> {
  const { data } = await api.get<Prototype[]>("/prototypes", {
    params: search ? { search } : undefined,
  });
  return data;
}

export async function fetchPrototypeById(id: number): Promise<Prototype> {
  const { data } = await api.get<Prototype>(`/prototypes/${id}`);
  return data;
}

export async function createPrototype(payload: CreatePrototypePayload): Promise<Prototype> {
  const { data } = await api.post<Prototype>("/prototypes", payload);
  return data;
}

export async function deletePrototype(id: number): Promise<void> {
  await api.delete(`/prototypes/${id}`);
}
