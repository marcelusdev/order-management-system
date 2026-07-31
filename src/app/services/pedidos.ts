import { Injectable } from '@angular/core'; //Decorador do angular que marca essa classe como provider global, ou seja, injetável em outras
import { HttpClient } from '@angular/common/http'; //É a API do Angular, usada para fazer requisições HTTP (get/post/delete, etc) com o backend
import { Observable } from 'rxjs'; //Chamada de Reactive Extensions for Javascript o rxjs é uma biblioteca que trabalha com programação reativa, no caso usmaos o observable, que terá uma resposta única para a requisição HTTP, onde usaremos next caso positiva, error se caso negativa e complete caso finalizada
import { map } from 'rxjs/operators'; //Importamos o método de encadeamento de fluxo de dados (map) através da biblioteca rxjs, que é justamente uma biblioteca de método para lidar com dados assíncronos


//Shape/Interface que irá servir de molde para cada item dentro do pedido-detalhe
export interface ItemPedido {
  quantidade: number; //Quantidade de cada item (5x)
  item: string; //Itens do pedido (Calabresa/Frango com Catupiry)
}

//Shape do objeto Pedido com seus campos de id, status e etc
export interface Pedido { //Tornamos essa interface exportável para outros components nomeada de Pedido
  id?: number; // ? Significa opcional, no backend geralmente vem com ID, então se coloca por boas práticas
  nome: string; //Nome do cliente
  numero: string; //Numero do pedido que geramos com math.random
  status: string; //Status do pedido, que inicialmente é 'Preparando'
  idStatus: string; //Identificar para aplicar lógica de filtrando
  nomeStatus: string; //Nome que estará exposto no painel 
  itens?: ItemPedido[]; // <-- A interface antes agora é array de objetos
  visible?: boolean; //Visibilidade como boolean (true or false) e a possibilidade de ser opcional (?)
  textoBotao?: string; //Palavra que muda no botão de editar, entre "Editar" e "Voltar"

  /*OBS: Temos uma lógica de alterar o status do pedido, porém antes de confirmar de fato essa alteração, salvamos uma cópia do status anterior
  para caso o usuario desista de fazer tal edição, e clique em voltar, o status anterior prevaleça, por isso criamos essa propriedade que salva
  o estado anterior desse pedido*/
  statusOriginal?: { //Propriedade que irá abrigar em si dois valores próprios dentro dessa lógica
    nomeStatus: string; //Uma cópia do nome anterior
    idStatus: string; //Uma cópia do status anterior
    };
}

//Aplicando a injeção do Service
@Injectable({ //Injectable demonstra que esse component do service poderá ser injetado em outra dependêndia
  providedIn: 'root' //Provided in root significa que é um escopo global, ou seja, está dispnível em qualquer instância da aplicação
//OBS: Antigamente era necessário declarar isso em cada módulo, em providers, agora com o providedIn: root não é mais necessário, facilitando mais do q declarar em cada instância
})

//Classe de comunicação com o backend
export class PedidosService { //Exportando a classe para usar em outros components

  private apiUrl = 'http://localhost:3000/api/pedidos'; //URL ajustada conforme Backend, para uso do get/post e etc, e o private para que só seja usada nessa instância

  constructor(private http: HttpClient) {} //O Angular injeta uma instância de HTTPClient para uso privado do get/post no backend

  // Buscar todos os pedidos (GET)
  getPedidos(): Observable<Pedido[]> { //Fazemos um GET e irá retornar um Observable, ou seja, caso positivo irá exibir uma lista de pedidos
    return this.http.get<Pedido[]>(this.apiUrl); //Aqui retornamos o próprio observable diretamente para quem o tenha chamado
  }

  // Adicionar um pedido novo (POST)
  adicionarPedido(pedido: Pedido): Observable<Pedido> { //Envia o corpo do pedido já diretamente na requisição, gerando novamente um observable
    return this.http.post<Pedido>(this.apiUrl, pedido); //Retornando um observable já com o corpo do pedido enviado
  }

  // Atualizar um pedido (PUT/PATCH)
  atualizarPedido(id: number, dados: Partial<Pedido>): Observable<Pedido> { //Aqui identificamos o pedido através do id único e usamos o partial, para alterar especificamente apenas o que for necessário e claro sempre retornando um observable
    return this.http.patch<Pedido>(`${this.apiUrl}/${id}`, dados); //Mandamos a requisição http com patch, que diferente do put que altera tudo, o patch só altera o que for necessário, e assim interpolamos para identificar pela id do pedido e os dados necessários para alterar, montando a URL completa
  }

  // Remover pedido (DELETE)
  removerPedido(id: number | string): Observable<void> { //Identificamos o pedido pelo number ou string e retorna o observable, mass como não retorna nada de substancial, apenas o status da operação, usamos o void, indo posteriormente para a lógica com next ou error
    return this.http.delete<void>(`${this.apiUrl}/${id}`); //Retornando a requisição com http com a url e o id concatenados para formar a url completa
  }

  //Encontrar o pedido pelo número

  //Criamos a função getPedidoPorNumero, com o número: string como parâmetro, pois é o referencial que usaremos para encontrar no método find
  //E também retorna um observable, podendo ser o proprio pedido ou undefined
  getPedidoPorNumero(numero: string): Observable<Pedido | undefined> { 
    return this.getPedidos().pipe( //Retornamos com o método getPedidos, que retorna o array completo de pedidos, e o filtramos e encadeamos com o método pipe, que é um método que lida com fluxos assíncronos
      map(pedidos => pedidos.find(p => p.numero === numero)) //Com esse filtro do array, pelo pipe, podemos utilizar o método map que transforma todo esse array em um pedido único, através do método find que busca o pedido pelo número
    );
  }

  //Função de alteração do estado do pedido através de requisição http PUT
  atualizarStatus(numero: string, nomeStatus: string, idStatus: string) { //numero será o identificador do pedido, sendo o mesmo que  o backend usa na sua url, e o nome e id status são para mudanças do nome e do estilo de cada status único
    return this.http.put<Pedido>(`${this.apiUrl}/${numero}`, { nomeStatus, idStatus }); //Aqui fazemos a requisição propriamente dita com injeção do httpclient, que foi injetado através do constructor, e o .put que é para alteração de algo já existente
    // (`${this.apiUrl}/${numero}` Chamamos a rota específica do backend  
    //{ nomeStatus, idStatus }) E mandamos o corpo da requisição que desejamos, que é o nome e id do pedido a serem alterados
  }

}


