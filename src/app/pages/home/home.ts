import { Component, OnInit, OnDestroy } from '@angular/core'; //Import padrão da classe typescript em Component utilizável do angular e o OnInit para inicializar os pedidos do backend corretamente
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; //Import q permite utilizar ícones do fontawesome do angular
import { faChevronRight} from '@fortawesome/free-solid-svg-icons'; //Import do ícone que será utilizado que é uma seta
import { RouterModule } from '@angular/router'; //Módulo de Roteamento para navegar entre páginas
import { CommonModule } from '@angular/common'; //Importa funcionalidades básicas do Angular (ngIf e ngFor)
import { FormsModule } from '@angular/forms'; //Permite uso do ngModel que é a interação entre o input e variáveis
import { SocketService } from '../../services/socket';
import { PedidosService, Pedido } from '../../services/pedidos'; //Importando o nosso Service e o Array de Pedidos, chamado de Pedido
import { Subscription } from 'rxjs';

@Component({ //Imports standalone que será usado com Angular
  selector: 'app-home', //Nome do componente html que será usado <app-home></app-home>
  standalone: true, //Standlone é um componente que não depende de nenhum outro e tem suas próprias dependência sem depender de outro como era anteriormente
  imports: [FontAwesomeModule, RouterModule, FormsModule, CommonModule], //Imports de ícones, roteamento entre páginas, forms e funcionalidades
  templateUrl: './home.html', //Onde está o html
  styleUrls: ['./home.css'] //Onde estão os estilos css
})

export class HomeComponent implements OnInit, OnDestroy{ //Aqui começa a classe de importações onde estarão as lógicas, variáveis e etc

  pedidos: Pedido[] = []; // Array que vamos usar no template e depois backend
  faChevronRight = faChevronRight; //Associando o nome do ícone para uso no html
  filtroStatus: string = 'Todos'; //Inicializa a variável com 'Todos' os pedidos
  busca: string = ''; //E a variável de busca inicializa zerada

  private subscriptions: Subscription[] = []; // Guarda todas as assinaturas do socket
  private audioNotificacao = new Audio('assets/som_painel.mp3'); // Ajuste o nome depois

  private tocarSom(): void {
  this.audioNotificacao.currentTime = 0; // Reinicia caso toque rápido
  this.audioNotificacao.play().catch(() => {});
}



  //Injeção do Service
  constructor( 
    private socketService: SocketService, //Injetamos uma instância do socket service no homecomponent, que será inicializada assim que o component for criado, que é a atualização das mudanças em tempo real
    private pedidosService: PedidosService  //Injetamos uma instância do service quando nosso homecomponent for criado, pois será necessário para se conectar com o backend
  ) {}

  //Carregando pedidos no back
  ngOnInit(): void { //Chamado de Lifecycle Hook do Angular, O ngOnInit é chamado justamente após o constructor, para garantir que todas as dependências (service, api, etc) tenha sido devidamente carregadas, antes de fazer a requisição por meio dele

    this.carregarPedidos(); //Requisitando os pedidos no backend

    // Eventos do socketService
    const eventos = { //Criamos a constante de eventos para lidar com os eventos de emit que virão do socket que serão ouvidos pelo componente

      //Com isso nomeamos o evento vindo do backend que no caso é pedidoCriado
      //E o adicionamos como dado Pedido
      //E por fim usamos o método push para adicioná-lo ao próprio array this.pedidos
      pedidoCriado: (pedido: Pedido) => {
        this.pedidos.push(pedido);
        this.tocarSom(); //som ao criar
      },

      
      pedidoAtualizado: (pedidoAtualizado: Pedido) => { //Outro evento vindo do servidor, agora sendo o pedidoAtualizado, que com o callback o transforma em um dado da interface typescript Pedido

        //Verificar qual pedido de fato foi atualizado
        //Cria uma constante que procura dentro do array pedidos, o número do pedido atualizado correspondente ao que foi alterado vindo do back
        const index = this.pedidos.findIndex(p => p.numero === pedidoAtualizado.numero);

        //Se o índice NÃO FOR = -1, ou seja, realmente exista, substitui esse pedido antigo no array (index) pelo atual (pedidoAtualizado)
        if (index !== -1){

          this.pedidos[index] = pedidoAtualizado;
          this.tocarSom(); //som ao criar
        }
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

  //Criando a função de requisição de pedidos no backend
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

      // Aplica o filtro de status
      const statusValido =
        this.filtroStatus === "Todos" || p.nomeStatus === this.filtroStatus; //Verifica se está filtrando todos ou em algum status específico

      // Verifica se a busca corresponde ao nome ou sobrenome completo
      const correspondeBusca =
        nome.startsWith(busca) || //Filtragem do Nome como um todo
        primeiroNome.startsWith(busca) || //Filtragem apenas Primeiro Nome
        sobrenome.startsWith(busca) || //Filtragem apenas do Sobrenome
        numero.startsWith(this.busca) || //Filtragem do numero do pedido
        status.startsWith(busca); //Filtragem por status

        return statusValido && correspondeBusca; //Após finalizar ambas lógicas, pedido para retorná-las no final, como uma booleana (true/falsy)

    });
  }


  ngOnDestroy(): void { //Esse é o motodo de ciclo de vida do component angular, executado quando deixa de ser exibido em tela (destruído)

    // Cancela todas as assinaturas do socket para evitar memory leaks

    //Como toda inscrição fica guardada em memória, mesmo apos fechar a pagina, e podendo ser duplicada quando aberta novamente, fazemos questão
    //destruir juntamente com o component, todas as assinaturas feitas ali até então, mantendo o  bom desempenho e evitando memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe()); //Referenciamos o array subscriptions que percorre CADA assinatura, e damos um unsubscribe que é o métoddo que cancela CADA assinatura feita, até ali.
  }

}


