import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization");
    console.log("🔄 Proxy GET /orders");
    console.log("📍 Backend URL:", BACKEND_URL);

    const response = await fetch(`${BACKEND_URL}/orders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: token }),
      },
    });

    console.log("📡 Proxy: Status da resposta:", response.status);

    // ✅ VERIFICAR SE A RESPOSTA É JSON
    const contentType = response.headers.get("content-type");
    console.log("📦 Content-Type:", contentType);

    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("❌ Resposta não é JSON:", text);
      
      return NextResponse.json(
        { 
          detail: "Backend retornou erro. Verifique se o servidor Python está rodando.",
          backend_response: text.substring(0, 200) 
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("✅ Proxy: Dados recebidos do backend:", data);

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("❌ Proxy: Erro ao buscar pedidos:", error.message);
    
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
    
    console.log("🔄 Proxy: Recebendo requisição para criar pedido");
    console.log("📦 Proxy: Body recebido:", body);
    console.log("🌐 Proxy: Enviando para:", `${BACKEND_URL}/orders`);

    const response = await fetch(`${BACKEND_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: token }),
      },
      body: JSON.stringify(body),
    });

    console.log("📡 Proxy: Status da resposta:", response.status);

    const contentType = response.headers.get("content-type");
    
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("❌ Resposta não é JSON:", text);
      
      return NextResponse.json(
        { 
          detail: "Backend retornou erro. Verifique se o servidor Python está rodando.",
          backend_response: text.substring(0, 200) 
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("✅ Proxy: Dados recebidos do backend:", data);

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("❌ Proxy: Erro ao criar pedido:", error.message);
    
    return NextResponse.json(
      { 
        detail: "Erro ao conectar com o backend. Verifique se está rodando.",
        error: error.message 
      },
      { status: 500 }
    );
  }
}