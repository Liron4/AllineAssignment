"use server";

import { db } from "@/lib/db";

export interface Street {
  id: number;
  name: string;
  citySymbol: number;
}

export async function getStreetsByCity(citySymbol: number): Promise<Street[]> {
  const streets = await db.street.findMany({
    where: { citySymbol },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      citySymbol: true,
    },
  });
  return streets;
}
