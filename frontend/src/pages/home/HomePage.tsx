import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';

interface Plano {
  nome: string;
  preco: string;
  periodicidade: string;
  destaque?: boolean;
  beneficios: string[];
  cta: string;
  cor: string;
}

const planos: Plano[] = [
  {
    nome: 'Teste Grátis',
    preco: 'R$ 0',
    periodicidade: '/ 14 dias',
    cor: 'border-gray-300',
    cta: 'Começar grátis',
    beneficios: [
      '5 orçamentos por mês',
      '5 produtos no estoque',
      'Acesso ao painel básico',
      'Aprovação online de orçamento',
      'Suporte por e-mail',
    ],
  },
  {
    nome: 'Médio',
    preco: 'R$ 89',
    periodicidade: '/ mês',
    destaque: true,
    cor: 'border-blue-500 ring-2 ring-blue-500',
    cta: 'Assinar plano Médio',
    beneficios: [
      'Orçamentos ilimitados',
      'Produtos e estoque ilimitados',
      'Aprovação online de orçamento',
      'Alertas de estoque crítico',
      'Agenda sincronizada em tempo real',
      'Suporte prioritário',
    ],
  },
  {
    nome: 'Avançado',
    preco: 'R$ 169',
    periodicidade: '/ mês',
    cor: 'border-purple-500',
    cta: 'Assinar plano Avançado',
    beneficios: [
      'Tudo do plano Médio',
      'Setor financeiro completo',
      'Fluxo de caixa e DRE',
      'Cálculo automático de taxas de cartão (1x a 12x)',
      'Lançamentos manuais de receita e despesa',
      'Relatórios financeiros avançados',
      'Suporte VIP',
    ],
  },
];

const recursos = [
  {
    icone: '📦',
    titulo: 'Controle de Estoque',
    descricao:
      'Gerencie peças, defina quantidades mínimas e receba alertas automáticos quando o estoque estiver crítico.',
  },
  {
    icone: '💰',
    titulo: 'Orçamentos Inteligentes',
    descricao:
      'Crie orçamentos detalhados, envie o link público para o cliente e aprove com um clique, com baixa automática no estoque.',
  },
  {
    icone: '📅',
    titulo: 'Agenda em Tempo Real',
    descricao:
      'Sincronização via WebSocket: mecânicos e clientes veem os horários disponíveis atualizados ao vivo.',
  },
  {
    icone: '💳',
    titulo: 'Financeiro Completo',
    descricao:
      'Cálculo automático de taxas de cartão em até 12x, fluxo de caixa, receitas e despesas em um só lugar.',
  },
  {
    icone: '🔐',
    titulo: 'Segurança Total',
    descricao:
      'Autenticação JWT, senhas criptografadas com bcrypt e controle de acesso por perfis (Mecânico, Admin, Super Admin).',
  },
  {
    icone: '📊',
    titulo: 'Dashboard Intuitivo',
    descricao:
      'Visão geral do seu negócio com indicadores, status dos orçamentos e atalhos rápidos para o que importa.',
  },
];

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* NAVBAR */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔧</span>
            <span className="text-xl font-bold text-gray-900">Oficina Pro</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#recursos" className="hover:text-blue-600 transition">Recursos</a>
            <a href="#planos" className="hover:text-blue-600 transition">Planos</a>
            <a href="#como-funciona" className="hover:text-blue-600 transition">Como funciona</a>
            <a href="#faq" className="hover:text-blue-600 transition">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="secondary" className="!w-auto px-4">Entrar</Button>
            </Link>
            <Link to="/login">
              <Button className="!w-auto px-4">Criar conta</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-blue-500/30 border border-blue-300/40 text-blue-100 text-xs font-semibold px-3 py-1 rounded-full mb-6">
              ✨ Gestão completa para oficinas mecânicas
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              A oficina inteira no <span className="text-yellow-300">seu bolso</span>.
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
              Estoque, orçamentos, agenda, financeiro e aprovação online em uma única plataforma.
              Comece grátis, escale quando crescer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login">
                <button className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold px-8 py-4 rounded-lg transition shadow-lg">
                  Começar grátis — 14 dias
                </button>
              </Link>
              <a href="#planos">
                <button className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-lg transition">
                  Ver planos
                </button>
              </a>
            </div>
            <p className="text-sm text-blue-200 mt-6">
              ✅ Sem cartão de crédito &nbsp; ✅ Cancele quando quiser &nbsp; ✅ Suporte humanizado
            </p>
          </div>

          <div className="relative">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                <span className="w-3 h-3 rounded-full bg-green-400"></span>
                <span className="text-xs text-blue-100 ml-2">Painel da Oficina</span>
              </div>
              <div className="space-y-3">
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-xs text-blue-200">Orçamentos hoje</p>
                  <p className="text-2xl font-bold">R$ 4.850,00</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-xs text-blue-200">Estoque crítico</p>
                    <p className="text-2xl font-bold text-yellow-300">3 itens</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-xs text-blue-200">Agenda</p>
                    <p className="text-2xl font-bold">8 horários</p>
                  </div>
                </div>
                <div className="bg-green-500/20 border border-green-300/30 rounded-lg p-4">
                  <p className="text-sm">✅ Orçamento #1284 aprovado pelo cliente</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="py-20 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tudo que sua oficina precisa
            </h2>
            <p className="text-lg text-gray-600">
              Recursos pensados para o dia a dia da oficina mecânica, do pequeno mecânico autônomo
              até grandes centros automotivos.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recursos.map((r) => (
              <div
                key={r.titulo}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition"
              >
                <div className="text-4xl mb-4">{r.icone}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{r.titulo}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{r.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Em 4 passos, sua oficina organizada
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { n: '1', t: 'Crie sua conta', d: 'Cadastro em menos de 1 minuto, sem cartão.' },
              { n: '2', t: 'Cadastre peças', d: 'Adicione seu estoque e defina mínimos críticos.' },
              { n: '3', t: 'Crie orçamentos', d: 'Envie o link público para o cliente aprovar.' },
              { n: '4', t: 'Acompanhe tudo', d: 'Estoque, agenda e financeiro integrados.' },
            ].map((p) => (
              <div key={p.n} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                  {p.n}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{p.t}</h3>
                <p className="text-sm text-gray-600">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="py-20 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Escolha o plano ideal para sua oficina
            </h2>
            <p className="text-lg text-gray-600">
              Comece grátis, evolua conforme o seu negócio cresce. Sem fidelidade.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {planos.map((plano) => (
              <div
                key={plano.nome}
                className={`bg-white rounded-2xl p-8 border-2 ${plano.cor} ${plano.destaque ? 'shadow-2xl scale-100 md:scale-105 relative' : 'shadow-sm'
                  }`}
              >
                {plano.destaque && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MAIS POPULAR
                  </span>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plano.nome}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plano.preco}</span>
                  <span className="text-gray-500 text-sm">{plano.periodicidade}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plano.beneficios.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/login">
                  <button
                    className={`w-full py-3 rounded-lg font-semibold transition ${plano.destaque
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                      }`}
                  >
                    {plano.cta}
                  </button>
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-8">
            💬 Precisa de um plano customizado para sua rede de oficinas? <a href="#contato" className="text-blue-600 font-semibold">Fale com vendas</a>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Perguntas frequentes
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Preciso de cartão de crédito para o teste grátis?',
                a: 'Não. Você pode usar o plano grátis por 14 dias sem cadastrar nenhum cartão.',
              },
              {
                q: 'O que acontece se eu exceder os limites do plano Teste?',
                a: 'Você poderá fazer upgrade para o plano Médio a qualquer momento, com liberação imediata dos recursos.',
              },
              {
                q: 'Posso cancelar quando quiser?',
                a: 'Sim. Não temos fidelidade. O cancelamento é feito direto pelo seu painel.',
              },
              {
                q: 'Como meus clientes aprovam os orçamentos?',
                a: 'Você gera um link público do orçamento e envia por WhatsApp. O cliente aprova com um clique.',
              },
              {
                q: 'O sistema funciona no celular?',
                a: 'Sim, o painel é 100% responsivo e funciona em qualquer dispositivo.',
              },
            ].map((item) => (
              <details
                key={item.q}
                className="bg-white border border-gray-200 rounded-lg p-5 group"
              >
                <summary className="font-semibold text-gray-900 cursor-pointer flex items-center justify-between">
                  {item.q}
                  <span className="text-blue-600 group-open:rotate-180 transition">▾</span>
                </summary>
                <p className="text-gray-600 text-sm mt-3 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-blue-600 to-blue-900 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para colocar sua oficina no piloto automático?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Comece grátis agora. Sem cartão, sem compromisso.
          </p>
          <Link to="/login">
            <button className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold px-10 py-4 rounded-lg transition shadow-lg text-lg">
              Criar conta grátis
            </button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔧</span>
            <span className="font-bold text-white">Oficina Pro</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} Oficina Pro. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
