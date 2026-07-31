//IMPORTAÇÕES
import { Component } from '@angular/core'; //Import padrão do Angular marcando uma classe como Component, recebendo e rendereizando seus metados
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; //Import dos pack de ícones do fontawesome
import { faCartShopping } from '@fortawesome/free-solid-svg-icons'; //Import do ícone do carrinho de compras do fontawesome
import { faUpLong } from '@fortawesome/free-solid-svg-icons'; //Import do ícone do carrinho de compras do fontawesome
import { RouterModule } from '@angular/router'; //Import de recursos de navegação entre páginas únicas SPA (Single Page Application)
import { CommonModule } from '@angular/common'; //Import para uso do ngIf, ngFor, que serão utilizadas nas lógicas do selects
import { FormsModule } from '@angular/forms'; //Import para uso de formulários simples do Angular e sua manipulação
import { Pedido, PedidosService } from '../../services/pedidos'; //Import que será usado de caminho para injeção do constructor, envio do pedido p painel

//Decorador do component
@Component({
  selector: 'app-pedidos', //Nome da tag HTML que representa esse component (<app-pedidos></app-pedidos>)
  standalone: true, //Standalone é um método mais específico onde se importa apenas o que irá usar, sem precisar abrigar tudo no ngModule
  imports: [FontAwesomeModule, RouterModule, FormsModule, CommonModule], //Fazendo o import das diretivas e component que serão usados no HTML
  templateUrl: './pedidos.html', //Indicativo HTML que pertence o template q será usado
  styleUrls: ['./pedidos.css'] //Arquivo CSS que será usado no component
})
/*NOTAS:
1- Antes do Standalone, todo component para ser usado precisava estar declarado em um módulo (ngModule), mas com o standalone implantando, e já 
sendo usado como método padrão do Angular, o próprio component cria independente de um módulo, deixando o código mais simples e intuitivo
*/


//INICIO DA DECLARAÇÃO DA CLASSE DO COMPONENT, ONDE CONTERÃO MÉTODOS E PROPRIEDADES QUE O TEMPLETE IRÁ USAR
export class PedidosComponent {

  mensagemSucesso: string = '' // Armazena a mensagem de pedido realizado que será exibida
  exibirMensagem: boolean = false; // Controla se a mensagem aparece ou não, inicialmente false

  faCartShopping = faCartShopping; //Atribuindo o icone de carrinho a uma propriedade com mesmo nome, para o HTML inperpretá-lo
   faUpLong =  faUpLong; //Atribuindo ícone da seta para cima, para o html interpretar
  

  constructor(private pedidosService: PedidosService) {} // Aqui chamamos o constructor que irá injetar o service no nosso component

  clienteNome: string = ''; //Propriedade que irá armazenar o campo nome do input, que começa vazio ''
  erroNome: string = ''; //O mesmo, só que agora para a mensagem de erro caso o campo não seja preenchido ou preenchido incorretamente

  validarNome() { //Criamos a função validarNome
    this.erroNome = ''; //Limpamos a mensagem de erro caso ela esteja visível e o campo seja preenchido corretamente
    if (!this.clienteNome.trim()) { //Usamos o trim para remover os espaços em branco no inicio e fim da string, evitando q valide o campo vazio
      this.erroNome = 'Por favor, preencha o nome e sobrenome.'; //E caso esteja vazio exibe a mensagem de erro, pedindo o preenchimento
      return false; //Não validando, dando um return false
    }

    const palavras = this.clienteNome.trim().split(' '); //Aqui separamos o nome e sobrenome em um array, através do split() e armazenamos na const

    if (palavras.length === 1) { //Se caso for preenchido apenas o primeiro nome ou seja a quantidade do array for igual a 1
      this.erroNome = 'Por favor, insira o sobrenome também.'; //Exibe uma mensagem de erro, pedindo para inserir o sobrenome também
      return false; //Retornando falso, ou seja, invalidando a lógica
    }
    return true; //E por fim se todas as condições forem atingidas, ai sim retorna verdadeiro e valida nossa lógica
  }

  permitirApenasDuasPalavras(event: KeyboardEvent) { //Função para limitar o campo para apenas nome e sobrenome, ligado ao evento do teclado (event: KeyboardEvent)
    const valor = this.clienteNome.trim(); //Armazenamos o valor do input novamente para a constante valor
    const palavras = valor.split(' '); //E a constante palavras que retorna um array novamente, usando o split que irá separar cada string através do espaço entre as palavras
    if (event.key === ' ' && palavras.length >= 2) { //Se o usuário apertar a tecla de espaço (event key === " ") mas houver já 2 palavras (nome e sobrenome)
      event.preventDefault(); //O evento (teclado de espaço) é bloqueado, limitando o campo apenas para nome e sobrenome
    }
  }

  limitarPaste(event: ClipboardEvent) { //Função que limita a colagem (Ctrl + V), por isso associado ao (event: ClipboardEvent)
    const pasteData = event.clipboardData?.getData('text') || ''; //Aqui buscamos dentro do evento de colagem (clipboardData) o texto dentro puro dentro dela (fetData(text)) OBS: o ? serve para evitar erro caso a colagem retorne null e quebre todo o código. E caso retorne null, mantenha o campo em branco (|| '')
    const partesAtuais = this.clienteNome.trim().split(' ').filter(p => p); //Aqui armazenamos em outra const, o valor que está no campo, removendo os espaços nas pontas (trim), dividindo e armazeando em um array (split) e o filter, percorre todo o array, validando apenas elementos que tenham valor real do array e não um espaço em branco
    const partesPaste = pasteData.trim().split(' ').filter(p => p); //Aqui se aplica a mesma lógica de acima, mas agora em relação aos elementos que forem colados diretamente no campo
    const espacoDisponivel = 2 - partesAtuais.length; //Aqui estabelecemos que o campo aceite apenas 2 palavras, menos a parte que já tenha q no máximo é 1 no caso nome
    if (espacoDisponivel <= 0) { //Aqui fazemos uma verificação extra para caso não haja mais espaço disponível para colagem e tente colar
      event.preventDefault(); //O navegador não permita que ocorra a colagem
      return; //Fazendo a função parar por aqui
    }

    const palavrasPermitidas = partesPaste.slice(0, espacoDisponivel); //Aqui garantimos através do metodo slice, que separa o array, devolvendo uma parte dele, no caso o primeiro índice que é o zero e o espaço disponível ainda para colagem
    event.preventDefault(); //Aqui prevenimos a colagem maior que o permitido, não permitindo o comportamento padrão, e fazendo a logica manualmente
    this.clienteNome = [...partesAtuais, ...palavrasPermitidas].join(' '); // E por finalizamos, juntando dois arrays em um só com um spread operado (..., ...) e usamos o join para colocar eles em uma string única

  }

                                                        /* SELECTS DE PIZZAS E BEBIDAS */

//ATRIBUINDO VALORES AOS ELEMENTOS

/*Aqui armazenamos a quantidade das pizzas inteiras, metades e as bebidas, atribuindo seu valor como number e já iniciando como 1, evitando que
o usuario adicione um pedido sem quantidade = 0*/
  quantidadePizzaInteira: number = 1;
  quantidadeMeioMeio: number = 1;
  quantidadeBebidas: number = 1;

/*Nessa armazenamos o valor do campo select, onde será uma string */
  pizzaInteira: string = '';
  pizzaMeio1: string = '';
  pizzaMeio2: string = '';
  bebida: string = '';

  carrinho: any[] = []; //Aqui é um array que vai armazenar todos os pedidos, e o any[] é justamente para aceitar qualquer tipo, visto que não há tipagem específica nesse carrinho
  erroCarrinho: string = ''; //Nesse colocamos uma mensagem de erro, caso haja problemas de adicionar algo ao carrinho, como adicionar algo com o carrinho vazio


//Lógica de aumento e diminuição da quantidade dos produtos

//Aqui estabelecemos que ao clicar no + aumenta em 1 (++) a quantidade, e se caso clicar no - diminui o valor, contando que o valor seja no mínimo 1, evitando que o usuario coloque 0
  aumentarQuantidadePizzaInteira() { this.quantidadePizzaInteira++; }
  diminuirQuantidadePizzaInteira() { if(this.quantidadePizzaInteira>1) this.quantidadePizzaInteira--; }
  aumentarMeioMeio() { this.quantidadeMeioMeio++; }
  diminuirMeioMeio() { if(this.quantidadeMeioMeio>1) this.quantidadeMeioMeio--; }
  aumentarBebidas() { this.quantidadeBebidas++; }
  diminuirBebidas() { if(this.quantidadeBebidas>1) this.quantidadeBebidas--; }


//FUNÇÃO DE ADICIONAR AO CARRINHO

  adicionarAoCarrinho() { //Função de adicionar ao carrinho que será executada ao clicar no botão de adicionar
    
/*Aqui nomeamos a constantes e verificando se alguma sabor ou bebida foi selecionado, através de uma boolean (!!) onde se um sabor for selecionado
retorna true, e caso nenhum tenha sido selecionado retorna false */    
    const pizzaInteiraSelecionada = !!this.pizzaInteira;
    const meioMeioSelecionado = !!this.pizzaMeio1 && !!this.pizzaMeio2;
    const bebidaSelecionada = !!this.bebida;


//VERIFICANDO OS CAMPOS DE PIZZA OU BEBIDA VAZIOS

//Verifica que se caso nenhum dos sabores ou bebidas tiver sido selecionado, exibe uma mensagem de erro caso tente adicionar ao carrinho e interrompe o fluxo
    if (!pizzaInteiraSelecionada && !meioMeioSelecionado && !bebidaSelecionada) {
      this.erroCarrinho = 'Nenhum item foi adicionado ao carrinho.';
      return;
    }

//Outra verificação, mas agora específica é para pizza meio a meio, onde evita que somente um sabor seja preenchido, obrigando que os dois sabores sejam preenchidos, caso contrário, exibe uma mensagem de erro e interrompe o fluxo
    if ((this.pizzaMeio1 && !this.pizzaMeio2) || (!this.pizzaMeio1 && this.pizzaMeio2)) {
      this.erroCarrinho = 'Você precisa selecionar os dois sabores da Pizza Meio a Meio antes de adicionar ao carrinho.';
      return;
    }
    

    this.erroCarrinho = ''; //Esse caso sejam validadas, as mensagens de erro desaparecem, indicando que a validação dos campos ocorreram

//LÓGICA DE ADICIONAR ITENS AO CARRINHO
    
    const adicionarOuSomar = (tipo: string, item: string, quantidade: number) => {//Aqui criamos uma função anônima (não tem nome próprio, e sim é estabelecida através dos valores que armazenamos, como string e number) para facilitar a referência que é o this.carrinho e não ter que repetir o código várias vezes para referenciar os mesmos parâmetros (item, tipo e quantidade) ou seja, toda vez que adicionar algo ao carrinho, é por aqui
      const existente = this.carrinho.find(i => i.tipo === tipo && i.item === item); //Aqui percorremos o array carrinho para verificar se existe um item igual ao que está sendo adicionado, caso tenha será armazenado na variável existente, se não encontrar, será undefined
      if (existente) { //Se encontrar (não será undefined, logo não irá criar um novo objeto)
        existente.quantidade += quantidade; //Apenas adiciona ao item que já está no carrinho, aumentando sua quantidade
      } else { //Caso contrário, ou seja, caso não tenha nenhum item do tipo já adicionado ao carrinho (undefined)
        this.carrinho.push({ tipo, item, quantidade }); //Cria um objeto com tipo (pizza inteira), item (calabresa) e quantidade (1x) e adiciona ao carrinho com o método .push
      }
    };

//ADICIONANDO A LÓGICA AOS PRODUTOS

/*Se caso uma pizza inteira estiver selecionada, chama a função do adicionarOuSomar, que irá passar seu tipo, item e quantidade, verificando se
tais itens já foram adicionados anteriormente ao carrinho, ou não, se caso estiverem, apenas aumenta a quantidade no carrinho, caso contrário
irá criar um novo objeto com seus parâmetros no carrinho, como foi configurado pela lógica feita no adicionarOuSomar 
OBS: o this.pizzaInteira! foi adicionado um non-null assertion operator (!) que força o compilador do TS que o pizzaInteiraSelecionado jamais 
terá um valor de undefined/null, só para garantir que o compilador seja satisfeito*/
    if (pizzaInteiraSelecionada) adicionarOuSomar('Pizza Inteira', this.pizzaInteira!, this.quantidadePizzaInteira);



    if (meioMeioSelecionado) { //Se pizza de meio a meio for selecionada e ambos sabores a e b selecionados
      
      const a = this.pizzaMeio1!;
      const b = this.pizzaMeio2!;

      if (a === b) { //Se ambos sabores forem o mesmo

        adicionarOuSomar('Pizza Inteira', a, this.quantidadeMeioMeio); //Trata a pizza como pizza inteira como visto no parâmetro

      } else {// Caso contrário, ou seja sabores diferentes

        const sorted = [a, b].sort(); //Criamos um array com os dois sabores, que serão organizados em ordem alfabética, através do sort()
        const itemMeio = `${sorted[0]}/${sorted[1]}`; //E aqui formatamos com uma template string, como ficará ao adicionar no carrinho sabor 1(`${sorted[0]}) / e sabor 2${sorted[1]}`), ex: Calabresa/Portuguesa
        adicionarOuSomar('Meio a Meio', itemMeio, this.quantidadeMeioMeio); //E por fim adicionamos a lógica do adicionarOuSomar
      }
    }

//Novamente a mesma ideia das pizzas, se a flag de bebida for true, adiciona/soma a bebida selecionada  
    if (bebidaSelecionada) adicionarOuSomar('Bebida', this.bebida!, this.quantidadeBebidas);

// Ao adicionar ao carrinho reseta os selects ao padrão e as quantidades a 1 novamente
    this.pizzaInteira = '';
    this.pizzaMeio1 = '';
    this.pizzaMeio2 = '';
    this.bebida = '';
    this.quantidadePizzaInteira = 1;
    this.quantidadeMeioMeio = 1;
    this.quantidadeBebidas = 1;
  }

/*Aqui adicionamos o botão para remover pedido do carrinho, usando como parâmetro, o índice number referente a cada item, e a partir disso usamos 
o splice que altera o array original, removendo o item que for referente a posição do index em questão*/
  removerItem(index: number) { this.carrinho.splice(index, 1); }



/*FINALIZAÇÃO DO PEDIDO*/

  finalizarPedido() { //Função de quando clicar no botão de finalizar o pedido

    let partes = this.clienteNome.trim().split(' '); //Pega a string (clienteNome) remove os espaços das pontas com o .trim e a transforma em um array com o .split, que são separadas por um espaço
    this.clienteNome = partes.slice(0, 2).join(' '); //Retorna esse array novamente para uma string com o método join, com apenas o primeiro e segundo índice, no caso nome e sobrenome
    
    //RESETA TODAS AS MENSAGENS DE ERRO, CASO TENHAM SIDO CORRIGIDOS
    this.erroNome = '';
    this.erroCarrinho = '';

    if (!this.clienteNome.trim()) this.erroNome = 'Por favor, preencha o nome e sobrenome.'; //Verifica se o input do nome do cliente está vazio, se for, será true deviado ao ! que inverte o valor, entrando no if, e assim exibindo a mensagem de erro
    else if(!this.validarNome()) this.erroNome = 'Por favor, insira o sobrenome também.'; //Da mesma forma a função que criamos de validar nome, caso só preencha o primeiro nome, irá retornar true, novamente devido a inverção do !, e assim executando o if, que exibe a mensagem de erro para preencher o sobrenome

    if(this.carrinho.length === 0) this.erroCarrinho = 'Nenhum item foi adicionado ao carrinho.'; //Se nada tiver sido adicionado ao carrinho (carrinho.length [quantidade] for zero) exibe a mensagem de erro também

    if(this.erroNome || this.erroCarrinho) return; //Verifica se as variáveis de erro foram preenchidas, caso sim, interrompe a execução, para que siga enviando o pedido



//GERADOR DE NÚMERO ALEATÓRIO DO PEDIDO

/*Primeiro geramos um número entre 0 e 1 (exclui o 1, ex: 0,12333 - 0,9999) através do Math.random() e o multiplicamos por 9000, ficando entre 
0 e 8999,999 e agora somando 1000 ficará entre 1000 e 9999,999, ou seja sempre resultando em um número de 4 dígitos e o math.floor arredonda o
número para baixo, excluindo as casas decimais, sendo sempre [9999 - 1234 - 1020] e por fim o convertemos em texto/string, (toString), pois ele
será exibido no painel de pedidos */
    const numeroPedido = Math.floor(1000 + Math.random() * 9000).toString(); // número aleatório 4 dígitos

//Aqui ficam os dados que serão exibidos no painel armazenados na constante novoPedido    
    const novoPedido: Pedido = {
      nome: this.clienteNome, //Nome do Cliente como fortado em toda a lógica
      numero: numeroPedido, //Número do pedido que acabamos de formatar
      status: 'Preparando', //Status que inicia preparando, aqui para já lidar com a lógica js que criamos
      idStatus: 'preparando', //idStatus q herda as lógicas aplicadas nas filtragens do typescript
      nomeStatus: 'Preparando', //E o nome stauts que é literalmente o texto escrito Preparando
      itens: [...this.carrinho] //E o campo itens basicamente gera uma cópia independente com o spread operator (...) do nosso carrinho, no momento que o pedido for finalizado, e envia ao backend, evitando assim que quando o carrinho for zerado para o novo pedido, ele seja zerado no backend também
    };

  //Enviando novo pedido pro backend
  this.pedidosService.adicionarPedido(novoPedido) //Chamamos o service, com a lógica de adicionarPedido, que é um método post para o backend, tendo como parâmetro, todo o body do novoPedido
    .subscribe({ //Sendo um observable, ou seja, uma requisição HTTP assíncrona para o backend, usamos o subscribe para aguardar a resposta da requisição
      next: (pedidoSalvo) => { //Caso a resposta seja positiva, o next traz a resposta da requisição, com o pedido salvo no backend 
      },
      error: (err) => { //Caso dê erro na requisição HTTP, o erro aparece
        console.error('Erro ao salvar pedido no backend:', err); //E aparece a mensagem de erro no console
      }
    });

  // Exibe a mensagem de sucesso
  this.mensagemSucesso = 'PEDIDO FINALIZADO COM SUCESSO!!\nACOMPANHE O STATUS PELO PAINEL'; //Usamos \n na mensagem para pular a linha
  this.exibirMensagem = true; //Torna o bolean verdadeiro, exibindo a mesangem

  //Faz a página rolar suavemente até o topo
  window.scrollTo({ top: 0, behavior: 'smooth' }); //Scrolla suavemente (behavior smooth), para o topo


  // Esconde a mensagem depois de 10 segundos
  setTimeout(() => { //Após um tempo (10 segundos)
    this.exibirMensagem = false; //Desativamos a lógica
    this.mensagemSucesso = ''; //E zera a string
  }, 10000);

  // Reseta formulário e carrinho
  this.clienteNome = '';
  this.carrinho = [];
  this.quantidadePizzaInteira = 1;
  this.quantidadeMeioMeio = 1;
  this.quantidadeBebidas = 1;

  }
} 