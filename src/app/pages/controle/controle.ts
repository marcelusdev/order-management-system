import { Component, OnInit, OnDestroy } from '@angular/core'; //Import padrão da classe typescript em Component utilizável do angular e o OnInit para inicializar os pedidos do backend corretamente
import { RouterModule } from '@angular/router'; //Módulo de Roteamento para navegar entre páginas
import { CommonModule } from '@angular/common'; //Importa funcionalidades básicas do Angular (ngIf e ngFor)
import { FormsModule } from '@angular/forms'; //Permite uso do ngModel que é a interação entre o input e variáveis
import { PedidosService, Pedido } from '../../services/pedidos'; //Importando o nosso Service e o Array de Pedidos, chamado de Pedido
import { trigger, state, style, transition } from '@angular/animations'; //Importando biblioteca de animação e seus atributos
import { SocketService } from '../../services/socket'; // Ajuste o caminho conforme seu projeto
import { Subscription } from 'rxjs';

@Component({  //Imports standalone que será usado com Angular
  selector: 'app-controle', //Nome do componente html que será usado
  standalone: true, //Standlone é um componente que não depende de nenhum outro e tem suas próprias dependência sem depender de outro como era anteriormente
  imports: [RouterModule, FormsModule, CommonModule], //Imports roteamento entre páginas, forms e funcionalidades
  animations: [ //Import de animação
    trigger('fadeInOut', [ //Criamos o gatilho da animação chamado fadeInOut para atribuir a um elemento HTML
      state('visible', style({ opacity: 1 })), // Define o estado visível com opacidade de 1
      state('hidden', style({ opacity: 0, display: 'none' })), // E o estado oculto terá opacidade 0, e o display none
      transition('visible <=> hidden', [ //Transição de visivel para oculto e vice-versa
      ])
    ])
  ],
  templateUrl: './controle.html', //Onde está o html
  styleUrls: ['./controle.css'] //Onde estão os estilos css
})
export class ControleComponent implements OnInit, OnDestroy {
  
  pedidos: Pedido[] = []; // Array que vamos usar no template e depois backend
  busca: string = ''; //E a variável de busca inicializa zerada

  private subscriptions: Subscription[] = []; // Guarda todas as assinaturas do socket

  // Map para controlar timers individuais de cada pedido entregue
  private contadores: { [numero: string]: any } = {}; //Contadores é o objeto, e número será a forma de individualizá-los para lidar com cada pedido, e o any para evitar conflito sobre tipagem que as vezes pode varias em alguns casos
  public contagemRestante: { [numero: string]: number } = {}; //Já esse é o cronômetro de exibição do HTML, que irá mostrar o tempo para o pedido ser removido, ou caso o pedido mude status antes de do times encerrar, ele é abortado e removido
/*OBS: Contadores por ser uma lógica interna de funcionamento, é private para evitar que seja usada em outras instâncias, Já a contagemRestante
por ser uma lógica visual de funcionamento, que é o próprio cronômetro, é publica, para ter acesso em outras instâncias*/

  //Injeção do Service
  constructor(private pedidosService: PedidosService, //Injetamos uma instância do service quando nosso homecomponent for criado, pois será necessário para se conectar com o backend
             private socketService: SocketService // Injetamos o socket
  ) {} 

  //Carregando pedidos no back
  ngOnInit(): void { //Chamado de Lifecycle Hook do Angular, O ngOnInit é chamado justamente após o constructor, para garantir que todas as dependências (service, api, etc) tenha sido devidamente carregadas, antes de fazer a requisição por meio dele
    this.carregarPedidos(); //no caso está requisitanddo os pedidos no backend

  // Eventos do socketService
    const eventos = { //Criamos a constante de eventos para lidar com os eventos de emit que virão do socket que serão ouvidos pelo componente

      //Com isso nomeamos o evento vindo do backend que no caso é pedidoCriado
      //E o adicionamos como dado Pedido
      //E por fim usamos o método push para adicioná-lo ao próprio array this.pedidos
      pedidoCriado: (pedido: Pedido) => this.pedidos.push(pedido), 

      
      pedidoAtualizado: (pedidoAtualizado: Pedido) => { //Outro evento vindo do servidor, agora sendo o pedidoAtualizado, que com o callback o transforma em um dado da interface typescript Pedido

        //Verificar qual pedido de fato foi atualizado
        //Cria uma constante que procura dentro do array pedidos, o número do pedido atualizado correspondente ao que foi alterado vindo do back
        const index = this.pedidos.findIndex(p => p.numero === pedidoAtualizado.numero);

        //Se o índice NÃO FOR = -1, ou seja, realmente exista, substitui esse pedido antigo no array (index) pelo atual (pedidoAtualizado)
        if (index !== -1) this.pedidos[index] = pedidoAtualizado;
      },

      pedidoRemovido: (pedidoRemovido: Pedido) => { //Nome da função ouvida que é o pedidoRemovido, e executa a função callback tipando o evento como dado Pedido
        this.pedidos = this.pedidos.filter(p => p.numero !== pedidoRemovido.numero); //Recriamos um novo array com método filter, onde ficarão apenas os pedidos que não sejam iguais (!==) ao pedidoRemovido
      }
    };

    // 💡 Inscrever todos os listeners e salvar as assinaturas

    //Usamos o object.entries transformar os 3 eventos vindos do backend em um array e os percorre em cada evento e sua função correspondente
    Object.entries(eventos).forEach(([evento, callback]) => {

    //Com isso chamamos o método listen do socket.Service com por consequencia retorna um observable para darmos um subscribe em qualquer um dos eventos que ocorrer
      const sub = this.socketService.listen(evento).subscribe(callback);
      
      this.subscriptions.push(sub); //Com isso adicionamos cada inscriçao no array subscriptions
    });

}

  //Carregando e utilizando os pedidos do back
  private carregarPedidos(): void { //Criamos uma função privada, que é o carregamento dos pedidos, visto que é uma função que só será usada nesse caso em específico, privamos ela para que não seja reutilizada em outra instância
    this.pedidosService.getPedidos().subscribe({ //Ao carregar os pedidos do service, usamos a função getPedidos que retorna um OBSERVABLE, que é uma requisição assíncrona, ou seja, irá primeiramente requisitar os pedidos no backend, e caso estejam prontos, usamos o subscribe, que é o que fazemos com a resposta da requisição (ideia bem parecida com as promises)
      next: (dados) => { //Next é o que fazemos com os dados, caso a requisição seja bem sucedida
        this.pedidos = dados; //Igualamos os dados (lista de pedidos) ao array de pedidos que criamos aqui, com o angular dectando e moldando para o template html (painel de pedidos)
      },
      error: (err) => { //E caso a requisição falhe (backend desligado, erro de rede, etc,) chamamos o método error que contém a mensagem de erro
        console.error('Erro ao carregar pedidos do backend:', err); //Mostrando também no console a mensagem de erro
      }
    });
  }

  get pedidosFiltrados() { //É um getter, ou seja, uma função que se comporta como uma propriedade, até por isso não o chamamos com () no html

    // Normaliza o texto: remove acentos e deixa tudo minúsculo
    const normalizar = (texto: string) =>
      texto
      //Como o javascript e outros sistemas podem ver a vogal e o acento como apenas um caractere, usamos o normalize (NFD) para separá-los
        ?.normalize("NFD") //Separa acento de vogal como caracteres únicos e o (?) para caso seja null/undefined não quebre código, retorna apenas undefined 
        .replace(/[\u0300-\u036f]/g, "") //Troca qualquer acento que tenha no texto, por string vazia, na prática removendo qualquer acento
        .toLowerCase() //Deixando tudo minúsculo para facilitar na filtragem
        .trim() || ""; //Remove quaisquer espaços em branco que tenha antes ou depois da string

    const busca = normalizar(this.busca); //Atribuindo toda função auxiliar de texto, na constante busca

    return this.pedidos.filter(p => { //Retorna apenas strings que estiverem dentro do método filter
      const nome = normalizar(p.nome); //Campo nome com toda lógica de texto aplicada
      const status = normalizar(p.nomeStatus); //Campo de status também com a lógica normalizar aplicada
      const numero = p.numero.toString(); //E o número de id filtrado normalmente sem qualquer regra, por serem apenas números

      // Verifica se o nome possui pelo menos duas partes para filtrar ambos
      const [primeiroNome, ...resto] = nome.split(" "); //Separamos o primeiro nome do sobrenome, com o método split
      const sobrenome = resto.join(" ").trim(); //E atribuimos o sobrenome em outra consntante

      

      // Verifica se a busca corresponde ao nome ou sobrenome completo
      const correspondeBusca =
        nome.startsWith(busca) || //Filtragem do Nome como um todo
        primeiroNome.startsWith(busca) || //Filtragem apenas Primeiro Nome
        sobrenome.startsWith(busca) || //Filtragem apenas do Sobrenome
        numero.startsWith(this.busca) || //Filtragem do numero do pedido
        status.startsWith(busca); //Filtragem por status

        return correspondeBusca; //Após finalizar ambas lógicas, pedido para retorná-las no final, como uma booleana (true/falsy)

    });
  }

  //FUNÇÃO DE EDITAR STATUS DO PEDIDO

   toggle(pedido: Pedido) { //Criamos a função nomeada de toggle, esperando como parâmetro o pedido

    pedido.visible = !pedido.visible; //Aqui estabelecemos que caso seja visible, inverte o valor, para oculto e vice-versa

    /*OBS IMPORTANTE: Não precisamos declarar que nosso elemento começará oculto, pois estabelecemos no service que ele é um boolean, ou seja 
    como ele não recebe nenhum valor, ele inicia undefined, que é um falsy para nosso boolean, que mantém os elementos ocultos, e só será true
    quando de fato tiver o evento de clique no botão de editar*/

    // Definimos que o texto do botão de edição inicialmente começará como 'Editar'
    if (!pedido.textoBotao) pedido.textoBotao = 'Editar';

    // Alterna o texto entre "Editar" e "Voltar" caso esteja visível o menu de edição (Voltar) ou caso esteja oculto (Editar)
    pedido.textoBotao = pedido.visible ? 'Voltar' : 'Editar';

    // Se entrou no modo edição, salva o status original
  if (pedido.visible) { //Se entrou no modo edição, ou seja, visible true
    pedido.statusOriginal = { //Gera uma cópia do status original, caso o usuario desista de fazer a edição e clique em voltar
      nomeStatus: pedido.nomeStatus, //Salva o nome do status
      idStatus: pedido.idStatus //E o id de estilização desse status
    };

  } else { //Caso contrário, ou seja, saiu do modo edição sem confirmar, (visible = false)

      if (pedido.statusOriginal) { //Verifica se existe um status anterior do pedido em questão
        pedido.nomeStatus = pedido.statusOriginal.nomeStatus; //Restaura o nome do status
        pedido.idStatus = pedido.statusOriginal.idStatus; //Restaura o id de estilização desse status
      }
    }
  }

//Função de alterar o visual do status no front, antes mesmo de ser mandado pro backend
  //Declaramos a função de alterarStatusVisual
  //Pedido: Objeto que será alterado
  //novoStatus: O novo texto de status
  //novoIdStatus: identificador css  
  alterarStatusVisual(pedido: Pedido, novoStatus: string, novoIdStatus: string) {
    pedido.nomeStatus = novoStatus; // Atualiza o novo nome do status
    pedido.idStatus = novoIdStatus; // E atualiza o novo id do status, para estilização

    // Se havia contagem de remoção, e status mudou antes de completar, cancela
    if (this.contadores[pedido.numero]) { //Vericamos se há um timer ativo (contadores) em algum pedido (pedido.número)
      clearInterval(this.contadores[pedido.numero]); //Se houver, usamos a função nativa js para cancelar um setInterval, no caso o cronômetro
      delete this.contadores[pedido.numero]; //E removemos da memória que aquele timer esteve ativo
      delete this.contagemRestante[pedido.numero]; //E por fim removemos o próprio cronômetro visual do HTML, pois o pedido não será removido
    }
  }

  //Função que confirmar alteração de status e envia do front para o back toda alteração
  confirmarAlteracao(pedido: Pedido) { //Tendo pedido como parâmetro
    const { numero, nomeStatus, idStatus } = pedido; //Fazemos uma pequena desestruturação do objeto para resgatar 3 propriedades, para evitar repetição

    this.pedidosService.atualizarStatus(numero, nomeStatus, idStatus).subscribe({ //Aqui de fato chamamos o service para a requisição put e assim atualizando o status no servidor backend, e usando o subscribe para validar o observable
      next: (pedidoAtualizado) => { //Caso a requisição seja positiva, o next tratará a resposta
        pedido.visible = false; //Tornando o botão de edição novamente ao seu estado padrão, ocultando as opções de alteração e botão de confirmar
        pedido.textoBotao = 'Editar'; //E o nome 'Editar' de volta

        // Se o pedido for entregue, inicia contagem
        if (pedido.nomeStatus === 'Entregue') { //Verifica se o status do pedido é o 'Entregue'
          let tempo = 60; // Criamos a variavel tempo, com o valor de 10 segundos para remoção
          this.contagemRestante[pedido.numero] = tempo; //E salvamos essa contagem dentro do contagemRestante que é o HTML visual do cronômetro

          this.contadores[pedido.numero] = setInterval(() => { //Estamos estabelecendo um cronômetro específico para cada pedido individualmente
            tempo--; //Nessa lógica, a cada 1 segundo (padraosetInterval) ele decremente um segundo
            this.contagemRestante[pedido.numero] = tempo; //E atualiza o valor novamente na variável tempo

            // Se o tempo chegar a zero, remove o pedido
            if (tempo <= 0) { //Se a contagem chegar a zero
              clearInterval(this.contadores[pedido.numero]); //Para o cronômetro
              delete this.contadores[pedido.numero]; //Remove ele do registro de memória
              delete this.contagemRestante[pedido.numero]; //Remove o cronômetro visual do html

              this.pedidosService.removerPedido(numero).subscribe({ //Chamamos o service com a requisição DELETE, imbutido na função remover pedido, onde identificamos o pedido pelo número e esperamos uma resposta pelo subscribe
                next: () => { //Caso a requisição seja positiva
                  this.pedidos = this.pedidos.filter(p => p.numero !== numero); //E através do filter, criamo um novo array em que a condição é que não haja o pedido que removemos
                  console.log(`Pedido ${numero} entregue e removido`); //E exibimos uma mensagem no console, identificando e confirmando o pedido removido
                },
                error: (erro) => console.error('Erro ao remover pedido após entrega:', erro) //Caso dê erro na requisição ele exibe a mensagem no console e não remove o pedido local para evitar inconsistência
              });
            }
          }, 1000); //Coloca o cronmetro decrementando a cada 1000 milissegundos (unidade padrão do sistema) = 1 segundo
        }
     },
    error: (erro) => console.error('Erro ao atualizar status:', erro) //E caso a requisição de alterar status falhe, é exibida mensagem de erro no console e na resposta
   });
  }

   ngOnDestroy(): void { //Esse é o motodo de ciclo de vida do component angular, executado quando deixa de ser exibido em tela (destruído)

    // Cancela todas as assinaturas do socket para evitar memory leaks

    //Como toda inscrição fica guardada em memória, mesmo apos fechar a pagina, e podendo ser duplicada quando aberta novamente, fazemos questão
    //destruir juntamente com o component, todas as assinaturas feitas ali até então, mantendo o  bom desempenho e evitando memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe()); //Referenciamos o array subscriptions que percorre CADA assinatura, e damos um unsubscribe que é o métoddo que cancela CADA assinatura feita, até ali.
  }

}
