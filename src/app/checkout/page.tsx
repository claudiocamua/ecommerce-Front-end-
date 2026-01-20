"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { toast } from "react-hot-toast";
import NavbarDashboard from "@/app/components/dashboard/NavbarDashboard";
import Footer from "@/app/components/layout/Footer";
import { authService } from "@/app/services/auth";
import PixPaymentModal from "@/app/components/payment/PixPaymentModal";
import BoletoPaymentModal from "@/app/components/payment/BoletoPaymentModal";
import {
  QrCodeIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

type PaymentMethod = "pix" | "credit_card" | "debit_card" | "boleto";

interface PaymentOption {
  id: PaymentMethod;
  name: string;
  icon: any;
  description: string;
  mock_status: string;
  statusColor: string;
}

interface OrderResponse {
  id: string;
  payment_status: string;
  payment_method: string;
  qr_code?: string;
  qr_code_base64?: string;
  ticket_url?: string;
  barcode?: string;
  date_of_expiration?: string;
  total: number;
}

const getIconForMethod = (id: string) => {
  switch (id) {
    case "pix":
      return QrCodeIcon;
    case "boleto":
      return DocumentTextIcon;
    case "credit_card":
    case "debit_card":
      return CreditCardIcon;
    default:
      return CreditCardIcon;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "in_process":
      return "bg-yellow-100 text-yellow-800";
    case "pending":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "approved":
      return "Aprovado";
    case "rejected":
      return "Negado";
    case "in_process":
      return "Processando";
    case "pending":
      return "Pendente";
    default:
      return status;
  }
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getTotalPrice, clearCart, loading: cartLoading } = useCart();
  const user = authService.getUser();
  const [loading, setLoading] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("pix");
  
  const [showPixModal, setShowPixModal] = useState(false);
  const [showBoletoModal, setShowBoletoModal] = useState(false);
  const [orderResponse, setOrderResponse] = useState<OrderResponse | null>(null);

  // Buscar métodos de pagamento da API
  useEffect(() => {
    const getPaymentMethods = async () => {
      try {
        setLoadingMethods(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/methods`);
        const data = await response.json();

        console.log(' Métodos de pagamento recebidos:', data);

        if (data.methods && Array.isArray(data.methods)) {
          const mappedMethods: PaymentOption[] = data.methods.map((method: any) => ({
            id: method.id,
            name: method.name,
            icon: getIconForMethod(method.id),
            description: method.description || `Pagamento via ${method.name}`,
            mock_status: method.mock_status,
            statusColor: getStatusColor(method.mock_status),
          }));

          setPaymentOptions(mappedMethods);
          
          // Definir PIX como padrão se existir
          const pixMethod = mappedMethods.find(m => m.id === "pix");
          if (pixMethod) {
            setSelectedPaymentMethod("pix");
          } else if (mappedMethods.length > 0) {
            setSelectedPaymentMethod(mappedMethods[0].id);
          }
        }
      } catch (error) {
        console.error(' Erro ao buscar métodos de pagamento:', error);
        toast.error('Erro ao carregar métodos de pagamento');
        
        // Fallback para métodos padrão
        setPaymentOptions([
          {
            id: "pix",
            name: "PIX",
            icon: QrCodeIcon,
            description: "Aprovação instantânea",
            mock_status: "approved",
            statusColor: "bg-green-100 text-green-800",
          },
        ]);
      } finally {
        setLoadingMethods(false);
      }
    };

    getPaymentMethods();
  }, []);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toast.error("Faça login para continuar");
      router.push("/login");
    }
  }, [router]);

  // Processar resposta do pagamento baseado no método
  const handlePaymentResponse = (order: OrderResponse) => {
    console.log(' handlePaymentResponse CHAMADO com:', order);
    
    const { payment_status, payment_method, qr_code, ticket_url } = order;

    console.log(' Dados extraídos:', {
      payment_status,
      payment_method,
      qr_code: !!qr_code,
      qr_code_length: qr_code?.length,
      ticket_url: !!ticket_url
    });

    console.log(' Salvando orderResponse no estado...');
    setOrderResponse(order);

    switch (payment_status) {
      case 'approved':
        console.log(' Pagamento PIX APROVADO!');
        
        if (payment_method === 'pix' && qr_code) {
          console.log(' ABRINDO MODAL PIX!');
          console.log(' setShowPixModal(true)');
          setShowPixModal(true);
          console.log(' Modal PIX deve estar aberto agora');
        } else {
          console.log(' Não vai abrir modal:', { payment_method, has_qr_code: !!qr_code });
          toast.success(' Pagamento aprovado! Redirecionando...');
          clearCart();
          setTimeout(() => {
            router.push(`/pedido/${order.id}/confirmado`);
          }, 2000);
        }
        break;

      case 'rejected':
        console.log(' Pagamento NEGADO!');
        toast.error(' Pagamento Recusado\n\nTente outro método de pagamento.');
        setTimeout(() => {
          router.push(`/pedido/${order.id}/rejeitado`);
        }, 2000);
        break;

      case 'in_process':
        console.log(' Pagamento EM PROCESSAMENTO...');
        toast.loading(' Pagamento em Análise\n\nVocê receberá um email de confirmação.', { 
          duration: 5000 
        });
        clearCart();
        setTimeout(() => {
          router.push(`/pedido/${order.id}/pendente`);
        }, 2000);
        break;

      case 'pending':
        console.log(' Boleto gerado!');
        
        if (payment_method === 'boleto' && ticket_url) {
          console.log(' ABRINDO MODAL BOLETO!');
          console.log(' setShowBoletoModal(true)');
          setShowBoletoModal(true);
          console.log(' Modal Boleto deve estar aberto agora');
        } else {
          console.log(' Não vai abrir modal:', { payment_method, has_ticket_url: !!ticket_url });
          toast.success(' Pedido criado! Aguardando pagamento.');
          clearCart();
          setTimeout(() => {
            router.push(`/pedido/${order.id}/pendente`);
          }, 2000);
        }
        break;

      default:
        console.warn(' Status desconhecido:', payment_status);
        toast.info('Pedido criado! Verifique o status.');
        clearCart();
        router.push(`/dashboard`);
    }
  };

  // Criar pedido com método de pagamento escolhido
  const createOrder = async (paymentMethod: PaymentMethod) => {
    console.log(' createOrder CHAMADO com método:', paymentMethod);
    
    const token = localStorage.getItem('access_token');

    if (!token) {
      toast.error("Você precisa estar logado");
      router.push("/login");
      return;
    }

    // Montar dados do pedido
    const orderData = {
      payment_method: paymentMethod,
      shipping_address: {
        street: "Rua Exemplo",
        number: "123",
        complement: "Apto 45",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        zip_code: "01234-567",
        country: "Brasil"
      },
      coupon_code: null
    };

    console.log(' Enviando pedido:', orderData);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      console.log(' Resposta recebida:', result);

      if (response.ok) {
        console.log(' Pedido criado com sucesso!');
        console.log(' Chamando handlePaymentResponse...');
        
        // Processar resposta baseado no status do pagamento
        handlePaymentResponse(result);
        
        return result;
      } else {
        console.error(' Erro ao criar pedido:', result.detail);
        toast.error(result.detail || 'Erro ao criar pedido');
        return null;
      }
    } catch (error) {
      console.error(' Erro na requisição:', error);
      toast.error('Erro ao processar pedido');
      return null;
    }
  };
  // Manipulador do checkout
  const handleCheckout = async () => {
    console.log(' handleCheckout CHAMADO');
    console.log(' Método selecionado:', selectedPaymentMethod);
    
    setLoading(true);

    try {
      await createOrder(selectedPaymentMethod);
    } catch (error: any) {
      console.error(" Erro no checkout:", error);
      toast.error(error.message || "Erro ao processar pedido");
    } finally {
      setLoading(false);
    }
  };

  const handleClosePixModal = () => {
    console.log(' Fechando modal PIX');
    setShowPixModal(false);
    clearCart();
    // Redirecionar para página de pedidos existente
    router.push('/dashboard/orders');
  };

  const handleCloseBoletoModal = () => {
    console.log(' Fechando modal Boleto');
    setShowBoletoModal(false);
    clearCart();
    // Redirecionar para página de pedidos existente
    router.push('/dashboard/orders');
  };

  const getSafeNumber = (value: any, defaultValue: number = 0): number => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  };

  const calculateItemPrice = (item: any): number => {
    const price = getSafeNumber(item.price, 0);
    const discount = getSafeNumber(item.discount_percentage || item.discount, 0);
    
    if (discount > 0) {
      return price * (1 - discount / 100);
    }
    return price;
  };

  const calculateTotalWithDiscount = (): number => {
    return cart.reduce((total, item) => {
      const finalPrice = calculateItemPrice(item);
      const quantity = getSafeNumber(item.quantity, 1);
      return total + (finalPrice * quantity);
    }, 0);
  };

  const calculateTotalWithoutDiscount = (): number => {
    return cart.reduce((total, item) => {
      const price = getSafeNumber(item.price, 0);
      const quantity = getSafeNumber(item.quantity, 1);
      return total + (price * quantity);
    }, 0);
  };

  if (cartLoading || loadingMethods) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <NavbarDashboard user={user} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-white font-semibold text-lg">
              {cartLoading ? "Carregando carrinho..." : "Carregando métodos de pagamento..."}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <NavbarDashboard user={user} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-12 text-center border border-white/20 max-w-md">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-2xl font-bold text-white mb-4">Carrinho Vazio</h1>
            <p className="text-white/80 mb-6">Adicione produtos para finalizar a compra</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-xl hover:bg-yellow-500 font-bold transition-all shadow-lg hover:shadow-xl"
            >
              Ir às Compras
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const totalWithDiscount = calculateTotalWithDiscount();
  const totalWithoutDiscount = calculateTotalWithoutDiscount();
  const totalSaved = totalWithoutDiscount - totalWithDiscount;

  console.log(' Render - Estados dos modais:', { 
    showPixModal, 
    showBoletoModal,
    hasOrderResponse: !!orderResponse
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <NavbarDashboard user={user} />

      <div className="flex-1 overflow-y-auto">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-8">
             Finalizar Compra
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Esquerda - Métodos de Pagamento */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
                <h2 className="text-xl font-bold text-white mb-6"> Escolha o Método de Pagamento</h2>

                {paymentOptions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-white/70">Nenhum método de pagamento disponível</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = selectedPaymentMethod === option.id;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setSelectedPaymentMethod(option.id)}
                          className={`
                            relative p-4 rounded-xl border-2 transition-all text-left
                            ${
                              isSelected
                                ? "border-yellow-400 bg-white/10 shadow-lg scale-105"
                                : "border-white/20 bg-white/5 hover:border-white/40"
                            }
                          `}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-yellow-400/20' : 'bg-white/10'}`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-white mb-1">{option.name}</h3>
                              <p className="text-sm text-white/70 mb-2">{option.description}</p>
                              <span className={`text-xs px-2 py-1 rounded ${option.statusColor}`}>
                                {getStatusLabel(option.mock_status)}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="absolute top-2 right-2">
                                <CheckCircleIcon className="w-6 h-6 text-yellow-400" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                     <strong>Modo de Teste:</strong> Este é um sistema de pagamento simulado para fins de demonstração.
                  </p>
                </div>
              </div>
            </div>

            {/* Coluna Direita - Resumo do Pedido */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 sticky top-24">
                <h2 className="text-xl font-bold text-white mb-6"> Resumo do Pedido</h2>

                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart.map((item) => {
                    const originalPrice = getSafeNumber(item.price, 0);
                    const discount = getSafeNumber(item.discount_percentage || item.discount, 0);
                    const finalPrice = calculateItemPrice(item);
                    const quantity = getSafeNumber(item.quantity, 1);
                    const itemTotal = finalPrice * quantity;

                    return (
                      <div key={item.id} className="bg-white/5 p-3 rounded-lg border border-white/10">
                        <div className="flex justify-between mb-1">
                          <span className="text-white/90 font-medium">
                            {item.name}
                          </span>
                          <span className="font-bold text-yellow-400">x{quantity}</span>
                        </div>
                        
                        {discount > 0 ? (
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 line-through text-xs">
                                R$ {(originalPrice * quantity).toFixed(2)}
                              </span>
                              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                                -{discount.toFixed(0)}%
                              </span>
                            </div>
                            <span className="font-bold text-green-400">
                              R$ {itemTotal.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <div className="flex justify-end">
                            <span className="font-bold text-white">
                              R$ {itemTotal.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-white/20 pt-4 space-y-3">
                  {totalSaved > 0 && (
                    <div className="flex justify-between text-sm text-gray-400">
                      <span className="line-through">Subtotal original:</span>
                      <span className="line-through">R$ {totalWithoutDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-white/80">
                    <span>Subtotal:</span>
                    <span className="font-bold">R$ {totalWithDiscount.toFixed(2)}</span>
                  </div>

                  {totalSaved > 0 && (
                    <div className="flex justify-between text-sm bg-green-400/10 p-2 rounded">
                      <span className="text-green-400 font-semibold">Você economiza:</span>
                      <span className="text-green-400 font-bold">R$ {totalSaved.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-white/80">
                    <span>Frete:</span>
                    <span className="text-green-400 font-semibold">GRÁTIS</span>
                  </div>

                  <div className="border-t border-white/20 pt-3 flex justify-between text-lg font-bold">
                    <span className="text-white">Total:</span>
                    <span className="text-green-400 text-2xl">R$ {totalWithDiscount.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading || paymentOptions.length === 0}
                  className="w-full mt-6 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all shadow-lg hover:shadow-xl text-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processando...
                    </span>
                  ) : (
                    ` Finalizar Pedido`
                  )}
                </button>

                <p className="text-xs text-white/60 text-center mt-4">
                   Pagamento 100% seguro e protegido
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />

      {/* Modais */}
      {showPixModal && orderResponse && (
        <PixPaymentModal
          qrCode={orderResponse.qr_code || ""}
          qrCodeBase64={orderResponse.qr_code_base64}
          orderId={orderResponse.id}
          amount={orderResponse.total}
          onClose={handleClosePixModal}
        />
      )}

      {showBoletoModal && orderResponse && (
        <BoletoPaymentModal
          ticketUrl={orderResponse.ticket_url || ""}
          barcode={orderResponse.barcode}
          orderId={orderResponse.id}
          amount={orderResponse.total}
          expirationDate={orderResponse.date_of_expiration || ""}
          onClose={handleCloseBoletoModal}
        />
      )}
    </div>
  );
}