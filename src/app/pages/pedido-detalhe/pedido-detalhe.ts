import { Component, OnInit, OnDestroy } from '@angular/core'; //Import padrão da classe typescript em Component utilizável do angular e o OnInit para inicializar os pedidos do backend corretamente
import { ActivatedRoute } from '@angular/router'; //Importamos o ActivatedRoute que é uma ferramenta Angular que acessa dados de uma URL, nesse caso ela captura o parâmetro ID do routes de cada pedido-detalhe que houver
import { RouterModule } from '@angular/router'; //Módulo de Roteamento para navegar entre páginas
import { CommonModule } from '@angular/common'; //Importa funcionalidades básicas do Angular (ngIf e ngFor)
import { PedidosService, Pedido } from '../../services/pedidos'; //Importando o nosso Service e o Array de Pedidos, chamado de Pedido
import { SocketService } from '../../services/socket';
import { Subscription } from 'rxjs';


//Decorador do component pedido-detalhe
@Component({
  selector: 'app-pedido-detalhe',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pedido-detalhe.html',
  styleUrls: ['./pedido-detalhe.css']
})

//Exportando o component
export class PedidoDetalheComponent implements OnInit, OnDestroy { //Tornamos a classe exportável com implementação de lógica Oninit, que são requisições http e etc, que no caso será ao backend com o array de pedidos

  pedido: Pedido | null = null; // Aqui tipamos o pedido, podendo ser um objeto pedido ou um null (não há nada)
  carregando: boolean = true; // Aqui controlamos o estado de loading, enquanto for true irá exibir uma flag de carregamento
  erro: string = ''; // Mensagem de erro caso não encontre

  private subscriptions: Subscription[] = []; // 🧩 armazenar assinaturas
  private audioNotificacao = new Audio('assets/som_painel.mp3'); // Ajuste o nome depois

  private tocarSom(): void {
    this.audioNotificacao.currentTime = 0; // Reinicia caso toque rápido
    this.audioNotificacao.play().catch(() => {});
   }

  //Injeção de dependências
  constructor(
    private route: ActivatedRoute, // Indica que haverá injeção de dependências do ActivatedRoute, que irá acessar os dados da URL
    private pedidosService: PedidosService, //E também uso dos Services
    private socketService: SocketService // 🧩 injeta o socket
    //OBS: private em ambos para evitar uso do template inteiro e se limitar apenas aos dados necessários
  ) {} //Ele ficará vazio, pois não há nenhuma lógica ncessária, serve apenas para DI (Injection Dependecy) a lógica mesmo será no ngOnInit

  ngOnInit(): void { //Aqui sobrescrevemos o OnInit que prometemos lá no export class, e por boas práticas declaramos o void, que é quando não haverá retorno de nenhum valor 

    //this.route é a injeção do ActivateRoute que dá acesso a rota atual
    //Snapshot é a captura do estado atual da rota, ou seja, quando component é criado
    //ParamMap.get pega o parâmetro id, que é o id individual de cada de pedido (pedido.numero)
    //Tudo isso armazenado na constante numero
    const numero = this.route.snapshot.paramMap.get('id'); 

    if (numero) { //Se a constante número, ou seja, de fato houver um valor (id) na constante, e na for null

      this.pedidosService.getPedidoPorNumero(numero).subscribe({ //Chama o método do service para buscar pelo número no array de pedidos, retornando um observable (requisição asyn)

        next: (pedido) => { //Aqui tratamos a resposta da requisição http caso seja positiva, com next, tendo como parâmetro o próprio o pedido que é a resposta do observable, podendo ser de fato um pedido ou undefined
          if (pedido) { //Se encontrar de fato um pedido
            this.pedido = pedido; // Pedido encontrado, e atualizamos seu estado no template, atribuindo seu valor pedido ao this.pedido(component)
          } else { //Caso contrário, ou seja, se o pedido for undefined
            this.erro = 'Pedido não encontrado ou removido.'; // Exibe mensagem de erro do pedido "Não encontrou" 
          }
          this.carregando = false; //E também com a resposta da requisição, limpamos o indicador de carregamento da resposta
        },

        error: (err) => { //Tratamento de erro, quando a requisição dá erro por algum motivo
          console.error('Erro ao buscar pedido:', err); //Mensagem de erro no console
          this.erro = 'Erro ao buscar pedido.'; //Mensagem de erro padrão que deu erro ao buscar o pedido
          this.carregando = false; //E também limpa a tela de carregamento da requisição, pois mesmo q negativa, já obtivemos nossa resposta
        }

      });
      
      // 💡 Escutar atualizações do socket
      //A constante subAtualizado armazena a inscrição no evento de escuta do pedidoAtualizado vindo do servidor, e guarda os dados do pedidoAtualizado: Pedio
      const subAtualizado = this.socketService.listen('pedidoAtualizado').subscribe((pedidoAtualizado: Pedido) => { 
        
        //Aqui se verifica se o pedido atual em si existe (this pedido) e se o número do pedido atualizado é igual o do pedido original
        if (this.pedido && pedidoAtualizado.numero === this.pedido.numero) {

        //Caso sejam números iguais (trata-se do mesmo pedido) então se atualiza o pedido anterior para o status atual
          this.pedido = pedidoAtualizado;
          this.tocarSom(); //som ao criar
          
        }
      });

      //Agora criamos outra constante para ouvir eventos de pedidos removidos vindos do backend
      const subRemovido = this.socketService.listen('pedidoRemovido').subscribe((pedidoRemovido: Pedido) => {

        //Verifica se trata do mesmo pedido, conferido se os números do pedido antigo e atualizado são os mesmios
        if (this.pedido && pedidoRemovido.numero === this.pedido.numero) {
          
          this.pedido = null; //Com o pedido removido, zeramos ele da interface, e é tratado pela mensagem de erro global, de pedido removido
        }
      });

      this.subscriptions.push(subAtualizado, subRemovido); //Adicionamos todas as inscrições da atualização ou remoção de pedidos no array subscriptions

    } else { //Caso contrário, o número na requsição da URL venha null, ou seja, sem parâmetro do id
      this.erro = 'Número do pedido não fornecido.'; //Exibe mensagem de erro de que o numero n foi fornecido na url
      this.carregando = false; //E também o carregamento da requisição é desativado
    }
  }

  ngOnDestroy(): void { //Quando o usuário, sai/troca/fecha a pagina em questão, o ngOnDestroy exclui todo o component carregado
    // 💡 Cancelar as inscrições do socket
    this.subscriptions.forEach(sub => sub.unsubscribe()); //E com isso todas as inscrições são excluídas da memória junto do component
  }

}
