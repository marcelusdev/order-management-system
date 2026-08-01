import { Injectable } from '@angular/core'; //Importando injectable do angular, para uso do socket service como injetável em outra aplicação
import { io, Socket } from 'socket.io-client'; //Impport do io, que conecta o angular (cliente), com o servidor socket.io (node.js) e o Socket que é o tipo de conexão, usado para declaração de var de um socket ativo
import { Observable } from 'rxjs'; //Importamos o Observable para lidar com os eventos do Socket.io, que ouve e reage automaticamente
import { API_URL } from '../api'; //Import da URL que vira da API do render que hospeda o backend

@Injectable({ //Decorador Angular que marca a classe como injetável
  providedIn: 'root' //E o providedinroot permite seu uso em uma instância global, através de uma única conexão ao invés de ser declarada em providers em várias conexões
})

export class SocketService { //Inicio da definição da classe e as todas suas funcionalidades

  private socket: Socket; //Aqui mantemos o Socket (conexão entre front e back via socket) em privado para garantir que nenhum arquivo interrompa ou tenha acesso a essa conexão e também para encapsula-la enquanto lógica (apenas o socket intermedia essa conexão front-back)

  constructor() { //Constructor é um método angular que executa assim que a aplicação for criada, ou seja, quando o socket service, inicia, o constructor executa o que estiver dentro dele

    //O io (client.io) cria uma conexão em tempo real com a porta do backend em tempo real, através de uma única conexão aberta em todo
    //tempo até que a aplicação seja desconectada, OU SEJA, diferente das requisições http que fecham após responderem.
    //Além de ser uma conexão bidirecional onde o cliente pode emitir mensagens ao servidor e vice-versa.
    //E justamente por ser uma conexão global e única disponível em todas as intâncias que ela é declarada no constructor, ou seja, é chamada
    //apenas uma vez, até que a conexão seja interrompida. O que seria diferente se tivese que ser declarada várias vezes em diferentes componentes
    this.socket = io(API_URL);
  }

  //MÉTODO LISTEN PARA OUVIR DIFERENTES EVENTOS DO SERVIDOR BACKEND, ATRAVÉS DE UM ÚNICO MÉTODO NO SOCKET (VERSÃO ENXUTA)

  /*OBS: É IMPORTANTE EXPLICAR QUE DIFERENTE DO SOCKET.IO QUE TRABALHA COM O CALLBACKS, O ANGULAR SINTONIZA MELHOR COM OBSERVABLES (RxJS), ENTÃO 
  QUANDO SE OUVE UM EVENTO DO SERVIDOR, JÁ RETORNAMOS ELE COMO OBSERVABLE PARA PODER SINTONIZAR COM O ANGULAR*/

  listen(eventName: string): Observable<any> { //Usamos o método listen, que escuta os eventos vindos do backend, que pode ser qualquer um dos 3 eventos (criar, alterar, deletar) que virão do home ou controle, que retorna um observable any, ou seja qualquer dado,
  return new Observable((subscriber) => { //Criamos manualmente um novo observable para lidar com o dado que será enviado ao component subscriber
    const handler = (data: any) => { //Toda vez que um eventName ocorrer, o handler irá ser acionado junto, que terá consigo os dados (data) desse mesmo evento
      subscriber.next(data); //E usa o método subscriber.next, que envia o dado, para os subscribers inscritos nessa lógica que no caso é home (painel de pedidos) e o controle (painel de controle)
    };

    this.socket.on(eventName, handler); //Usa-se o socket.on para ouvir o evento que vem do servidor, tendo com parâmetro, o nome do evento em si (eventName), e o que será feito com o mesmo ao receber (hendler)

    //Teardown: remove o listener quando o Observable for destruído
    return () => { //E a função retorna quando

      //Quando ocorre um unsubscribe, ou seja quando alguém sai da página, ou não está mais ativo, o evento listener é interrompido junto com o observable
      //Isso evita que vários listeners estejam ativos em um mesma página quando saem e entram muitas vezes
      //Ou seja fica ativo enquanto o usuário está ativo, e desativa quando o usuário está inativo
      this.socket.off(eventName, handler); 
    };
  });
}

}








  
