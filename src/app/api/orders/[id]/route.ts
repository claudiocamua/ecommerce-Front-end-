import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get("Authorization");
    console.log(" Proxy GET /orders/" + id);

    const response = await fetch(`${BACKEND_URL}/orders/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: token }),
      },
    });

    const data = await response.json();
    console.log(" Proxy: Pedido recebido:", data);

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error(" Proxy: Erro ao buscar pedido:", error.message);
    return NextResponse.json(
      { detail: "Erro ao buscar pedido" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get("Authorization");
    const url = new URL(request.url);
    
    console.log(" Proxy PATCH /orders/" + id);

    // Cancelar pedido
    if (url.pathname.endsWith("/cancel")) {
      const response = await fetch(`${BACKEND_URL}/orders/${id}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: token }),
        },
      });

      const data = await response.json();
      console.log(" Proxy: Pedido cancelado:", data);

      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(
      { detail: "Endpoint não encontrado" },
      { status: 404 }
    );
  } catch (error: any) {
    console.error(" Proxy: Erro ao atualizar pedido:", error.message);
    return NextResponse.json(
      { detail: "Erro ao atualizar pedido" },
      { status: 500 }
    );
  }
}