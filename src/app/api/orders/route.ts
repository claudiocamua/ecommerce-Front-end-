import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization");
    
    const isProduction = process.env.NODE_ENV === 'production';
    const shouldLog = !isProduction || !!token;
    
    if (shouldLog) {
      console.log(" [API/ORDERS] GET - Buscando pedidos do backend");
      console.log(" [API/ORDERS] Backend URL:", BACKEND_URL);
      console.log(" [API/ORDERS] Token presente:", !!token);
    }
    
    const response = await fetch(`${BACKEND_URL}/orders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: token }),
      },
      cache: 'no-store',
    });

    console.log(" [API/ORDERS] Status:", response.status);

    const contentType = response.headers.get("content-type");
    
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error(" [API/ORDERS] Resposta não é JSON:", text);
      
      return NextResponse.json(
        { 
          detail: "Backend retornou erro. Verifique se o servidor Python está rodando.",
          backend_response: text.substring(0, 200) 
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log(" [API/ORDERS] Pedidos recebidos:", data);

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error(" [API/ORDERS] Erro ao buscar pedidos:", error.message);
    
    return NextResponse.json(
      { 
        detail: "Erro ao conectar com o backend. Verifique se está rodando.",
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization");
    const body = await request.json();
    
    console.log(" [API/ORDERS] POST - Criando pedido");
    console.log(" [API/ORDERS] Body:", body);

    const response = await fetch(`${BACKEND_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: token }),
      },
      body: JSON.stringify(body),
    });

    console.log(" [API/ORDERS] Status:", response.status);

    const contentType = response.headers.get("content-type");
    
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error(" [API/ORDERS] Resposta não é JSON:", text);
      
      return NextResponse.json(
        { 
          detail: "Backend retornou erro. Verifique se o servidor Python está rodando.",
          backend_response: text.substring(0, 200) 
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log(" [API/ORDERS] Pedido criado:", data);

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error(" [API/ORDERS] Erro ao criar pedido:", error.message);
    
    return NextResponse.json(
      { 
        detail: "Erro ao conectar com o backend. Verifique se está rodando.",
        error: error.message 
      },
      { status: 500 }
    );
  }
}