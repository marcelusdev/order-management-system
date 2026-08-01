const express = require('express');// Importa a biblioteca Express e o atribuímos a uma constante para que não seja reatribuida e esteja no escopo global, ela irá servir para uso get/post/delete nas requisições http, sendo mais flexível e menos verboso na conexão com o backend
const app = express(); // Cria a instância do app expressm que é o coração do backend quando se trata de lidar com requisições http e afins
app.use(express.json()); //Ao fazer requisições com json, o angular transforma ele em um objeto javascript, ou seja é o tradutor do json para o backend
const PORT = process.env.PORT || 3000; // Porta do servidor backend ou do Render que iremos hospedar o backend
const cors = require('cors'); //Por padrão os servidores não podem mandar/receber requisições de portas diferentes como é o caso do front (port 4200) e o back (3000), e o cors viabiliza isso, informando ao servidor que a requisição entre essas duas portas é permitida
app.use(cors({origin: FRONTEND_URL})); //Habilitação do cors para que permita a conexão do backend e com o front, que são portas diferentes e por padrão não podem fazer requisição entre si, por isso o uso do middleware cors
const dotenv = require('dotenv'); // Importa o dotenv, que permite ler variáveis de ambiente do arquivo .env que são as crendenciaos para se conectar ao banco
dotenv.config(); // Carrega as variáveis de ambiente definidas no arquivo .env
const mongoose = require('mongoose'); // Importa o Mongoose, que é o ODM (biblioteca) responsável por conectar e interagir com o MongoDB
const MONGO_URI = process.env.MONGO_URI; // URI (Endereço único de conexão entre o servidor e o banco de dados) do banco, definida no .env
const FRONTEND_URL = process.env.FRONTEND_URL;
const http = require('http'); //Criamos um servidor HTTP separado e próprio para usar com WebSocket
const server = http.createServer(app); // Aqui criamos o servidor propriamente dito e colocamos o app como argumento, que é onde estão as requisições get/put/post/delete backend
const { Server } = require('socket.io'); //Importando o Socket.IO chamado server, que criará o servidor WebSocket no backend, permitando a conexão em tempo real entre o backend e todos os servidores conectados ao mesmo
const io = new Server(server, { //Instanciamos o socket.io, passando dois argumentos, o primeiro é o próprio server http, assim compartilhando a mesma porta e domínio do express
  cors: { //E o cors, definindo quem pode se conectar, e através de quais métodos
    origin: FRONTEND_URL, //Origin define quem pode se conectar ao websocket
    methods: ["GET", "POST", "PUT", "DELETE"] //E os métodos, no caso serão get, post, put e delete, todos relacionado a exibição e status dos pedidos
  }
});

//CONECTANDO O BANCO DA DADOS
mongoose.connect(MONGO_URI) //Chamamos a função de conexão do mongo, tendo como parâmetro o endereço URI, retornando uma promise, por padrão do mongo
  .then(() => { //Quando a conexão é bem sucedida, é tratado com then que apresenta o que ocorrerá após a conexão ser estabelecida
    console.log('✅ Conectado ao MongoDB com sucesso!'); //Primeiro uma mensagem de sucesso no console/terminal
    server.listen(PORT, () => { //E depois sim, a inicialzação do servidor backend junto ao socket.io, que vão dividir o mesmo servidor e porta, onde um lida com as requisições (express) e o outro com essas mudanças em tempo (real)
      console.log(`Servidor rodando na porta ${PORT}`); //Com também a mensagem de bem sucedido no console, sobre o servidor
    });
  })
  .catch(err => console.error('❌ Erro ao conectar ao MongoDB:', err)); //E caso de erro de conexão com o mongo, o catch irá capturar o erro e imprimir a mensagem de erro no console

const Pedido = require('./models/Pedido'); // Importa o model do Mongoose, para usar nas rotas

//💡 Configuração básica de conexão Socket.IO
//O io.on é o servidor websocket que criamos com o new server (server), que é o todo que viabilizará inúmeras conexões simultâneas
//Connection é disparado toda vez que um cliente se conecta via websocket e o backend detectará e executará esse disparo
//E o socket é responsável por cuida de cada conexão individualmente, gerando um id única para cada cliente (socket.id)
io.on('connection', (socket) => {
  console.log('💡 Novo cliente conectado:', socket.id); //Quando um cliente se conecta é imprimido no terminal a frase de conexão junto ao id do cliente
  socket.on('disconnect', () => { //Evento automático do socket.io que é quando o cliente se desconecta, fecha aba, servidor reinicia, etc
    console.log('💡 Cliente desconectado:', socket.id); //Nesse caso também é imprimido no terminal a frase de desconexão junto ao id do cliente
  });
});

// Rota GET /api/pedidos PARA LISTAR TODOS OS PEDIDOS
app.get('/api/pedidos', async (req, res) => { //Aqui criamos a rota com GET, com 1° parametro com a url api/pedidos e o segundo com o callback da rota que é requisição e a resposta da mesma, e o async para indicar que vão haver requisições que tem tempo de resposta para a requisição (operações assícronas)
  try { //Inicia o tratamento de excecões, e visto que operações com banco muitas vezes falham, usamos o try para ter, evitando que o servidor quebre e dê a melhor resposta, ou seja, caso o try falhe, o erro já é capturado no catch
    const pedidos = await Pedido.find({ nomeStatus: { $ne: 'Entregue' } }); // Busca todos os pedidos do MongoDB com o método find () perfeito para o mongooose, para retornar tudo, exceto ($ne = not equal) aqueles com status entregue 
    res.json(pedidos); //Caso bem sucedida, retorna todo os pedidos em formato json
  } catch (err) { //Caso o try falhe, o catch captura o erro
    res.status(500).json({ message: 'Erro ao listar pedidos', error: err.message }); //E responde com erro interno de servidor 500 e a mensagem de erro p listar os pedidos, junto com o motivo do erro
  }
});

// Rota GET /api/pedidos/:id PARA A PAGINA PEDIDO-DETALHE
app.get('/api/pedidos/:id', async (req, res) => { //Aqui criamos uma rota com o get, tendo como paramêtro o req da requisição (cliente) e o res (resposta a requisição) e o async para indicar que vão haver requisições que tem tempo de resposta para a requisição (operações assícronas)
  const id = req.params.id; // Armazenamos na const id, todos os parâmetros dinâmicos da URL
  try { //Inicia o tratamento de excecões, e visto que operações com banco muitas vezes falham, usamos o try para ter, evitando que o servidor quebre e dê a melhor resposta
    const pedido = await Pedido.findOne({ numero: id }); // Busca no MongoDB pelo campo 'numero' através do método findOne, na const Pedido, e por ser uma promise, usamos o await, que aguarda a resposta dessa requisição
    if (!pedido) { //Caso não encontre o pedido
      return res.status(404).json({ message: 'Pedido não encontrado' }); //Retorna um error404 e um json com a mensagem de que naõ foi encontrado
    }
    res.json(pedido); // Caso bem sucedido ele retorna o pedido encontrado em formato json
  } catch (err) { //Captura o erro que tenha acontecido no try
    res.status(500).json({ message: 'Erro ao buscar pedido', error: err.message }); //Responde com error de servidor 500 e com outra mensagem ao tentar buscar o pedido, e o motivo do erro capturado no try (talvez o motivo não seja interessante estar visivel ao cliente por ter informações sensíveis)
  }
});

// Rota POST /api/pedidos CRIAR PEDIDO
app.post('/api/pedidos', async (req, res) => { //Mais uma vez uma rota com http com método post, que envia dados ao servidor, sendo requisição assíncrona, com o req e res
  const novoPedido = req.body; // Recebe os dados do frontend através do express e os salva na constante novoPedido
  try { //Inicia o bloco de tratamento, em caso de falha retorna ao catch
    const pedidoCriado = await Pedido.create(novoPedido); // Salva o novoPedido no MongoDB usando o model, através do método Pedido.create próprio do Mongoose
    res.status(201).json(pedidoCriado); // Retorna o status 201 que é o 'Created' e também já retorna o novo pedido em formato json para o front
    //💡 Emitindo evento para todos os clientes conectados
    io.emit('pedidoCriado', pedidoCriado); //Através do método emi, ele irá enviar um evento (pedido criado) para todos os navegadores conectados ao servidor em questão, tendo a etiqueta e os dados em si desse envento, que no caso é novo pedido criado
  } catch (err) { //Caso o try falhe, ele será tratado no catch e o fluxo é interrompido
    res.status(500).json({ message: 'Erro ao criar pedido', error: err.message }); //Retorna o erro 500 de servidor e uma mensagem de erro ao criar pedido e a mensagem técnica do motivo do erro do pedido
  }
});

// Rota PUT para ATUALIZAR STATUS DE UM PEDIDO
app.put('/api/pedidos/:numero', async (req, res) => { //Com a a requisição http put e o parâmetro dinâmico (numero) para identificar o pedido que será alterado, seguimos com resições assincronas com req e res
  const numero = req.params.numero; //Aqui resgatamos o parâmetro número da URL atraves do req.params e salvamos na constante numero
  const { nomeStatus, idStatus } = req.body; //Aqui fazemos uma desestruturação do do req.body para resgatar apenas os elementos q iremos atualizar (nomeStatus e idStatus)
  try { //Iniciamos o tratamento com try
    const pedidoAtualizado = await Pedido.findOneAndUpdate( //Utilizamos o método findOneAndUpdate, para encontrar pedido, alterá-lo e retorná-lo já com a alteração feita em uma tacada só
      { numero }, // Filtro para encontrar o pedido pela constante numero
      { nomeStatus, idStatus }, // Campos que serão atualizados
      { new: true } // Retorna o documento atualizado (por padrão retornaria o antigo)
    );
    if (!pedidoAtualizado) { //Caso não encontre nenhum pedido retornará null
      return res.status(404).json({ message: 'Pedido não encontrado' }); //E retorna um erro 404 not found e um json com a mensagem de não encontrado
    }
    console.log(`Pedido ${numero} atualizado para status: ${nomeStatus}`); //Caso seja alterado, será informado no terminal/console qual pedido foi alterado e para qual status
    //💡 Emitindo evento para todos os clientes conectados
    io.emit('pedidoAtualizado', pedidoAtualizado); // Emite para todos aqueles conectados, a atualização do status do pedido
    res.json(pedidoAtualizado); //E claro retornará um json já com o pedido alterado, para uso e exibição no front
  } catch (err) { //Caso o try falhe o erro é pego no catch
    res.status(500).json({ message: 'Erro ao atualizar pedido', error: err.message }); //Retorna o erro 500 de servidor e uma mensagem de erro ao atualizar o pedido e a mensagem técnica do motivo do erro do pedido
  }
});

// Rota DELETE para REMOVER UM PEDIDO (apenas visualmente)
app.delete('/api/pedidos/:numero', async (req, res) => { //Requisição http com delete, com url dinâmica (numero) para identificar qual pedido remover, sendo assíncrona com req e res
  const numero = req.params.numero; //Resgatamos o número do pedido através da url e salvamos na constante número

  try { //Começamos o tratamento da requisição com try, caso falhe cai no catch
    const pedidoRemovido = await Pedido.findOne({ numero }); //Buscamos o pedido no banco, mas não o deletamos

    if (!pedidoRemovido) { //Verifica se o pedido foi encontrado
      return res.status(404).json({ message: 'Pedido não encontrado.' }); //Retorna o erro 404 Not Found e um json de que o pedido não foi encontrado
    }

    console.log(`Pedido ${numero} removido visualmente (mantido no banco).`); //Mostra no console que foi apenas uma remoção visual

    //💡 Emitindo evento para todos os clientes conectados
    io.emit('pedidoRemovido', pedidoRemovido); //Emite para todos em tempo real a "remoção" do pedido (apenas no front)

    res.status(200).json({ 
      message: 'Pedido removido visualmente (mantido no banco de dados).',
      pedido: pedidoRemovido
    }); //Retorna sucesso e o pedido que foi "removido visualmente"

  } catch (err) { //Caso o try falhe ao fazer a requisição delete, cai no catch que tratará o erro
    res.status(500).json({ 
      message: 'Erro ao processar remoção visual', 
      error: err.message 
    }); //Retornando um status 500 de erro interno, com mensagem de erro e motivo
  }
});


