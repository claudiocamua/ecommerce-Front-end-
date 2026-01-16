import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://ecommerce-backend-qm1k.onrender.com";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Proxy: Recebendo requisição para adicionar ao carrinho");
    
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      console.error("❌ Proxy: Token não encontrado");
      return NextResponse.json(
        { detail: "Token não fornecido" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("📦 Proxy: Body recebido:", body);

    const backendUrl = `${BACKEND_URL}/cart/add`;
    console.log("🌐 Proxy: Enviando para:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify(body),
    });

    console.log("📡 Proxy: Status da resposta:", response.status);

    // ✅ VERIFICAR SE A RESPOSTA É JSON
    const contentType = response.headers.get("content-type");
    
    if (contentType?.includes("application/json")) {
      const data = await response.json();
      console.log("✅ Proxy: Dados recebidos do backend:", data);
      return NextResponse.json(data, { status: response.status });
    } else {
      // ❌ RESPOSTA NÃO É JSON (ERRO DO BACKEND)
      const text = await response.text();
      console.error("❌ Proxy: Resposta não é JSON:", text);
      
      return NextResponse.json(
        { 
          detail: "Erro no servidor backend",
          error: text,
          status: response.status 
        },
        { status: response.status }
      );
    }

  } catch (error: any) {
    console.error("❌ Erro no proxy:", error);
    
    return NextResponse.json(
      { 
        detail: error.message || "Erro ao adicionar ao carrinho",
        error: error.toString()
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(request: NextRequest) {
  console.log("🔄 Proxy GET /cart");
  
  const token = request.headers.get("authorization");
  
  try {
    const response = await fetch(`${BACKEND_URL}/cart/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token || ""
      }
    });

    const data = await response.json();
    console.log("✅ Proxy: Dados recebidos do backend:", data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ Erro no proxy:", error);
    return NextResponse.json(
      { message: "Erro ao buscar carrinho" },
      { status: 500 }
    );
  }
}