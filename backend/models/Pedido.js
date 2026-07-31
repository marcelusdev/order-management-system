const mongoose = require('mongoose'); //Importamos a biblioteca do mongoose, permitindo a conexão o banco de dados com o backend (Node)

// Definindo o schema do pedido
const pedidoSchema = new mongoose.Schema({ //Através do construtor mongoose.Schema, criamos a estrutura do documento que será salvo no banco de dados do mongo
  nome: { type: String, required: true }, //Nome do cliente, que será uma string (texto) e será obrigado (required true)
  numero: { type: String, required: true, unique: true }, //Numero do pedido, string, obrigatório e o unique true que garante que não haverão dois pedidos com mesmo número
  idStatus: { type: String, default: 'preparando' }, //Id para estilizar de acordo com status, que inicialmente (default) será 'Preparando'
  nomeStatus: { type: String, default: 'Preparando' }, //Esse irá ser o nome em si do Status, que também por padrão inicial Preparando

  itens: [ //Array de objetos, no caso os pedidos que podem ser vários
    {
      item: { type: String, required: true }, //O nome do item (Pizzas e Bebidas)
      quantidade: { type: Number, required: true } //Quantidade de itens (1x Calabresa, 2x Coca)
    }
  ]
}, { timestamps: true }); // Timestamps adiciona createdAt (Data de criação) e updatedAt (Data da última atualização) automaticamente do pedido

const Pedido = mongoose.model('Pedido', pedidoSchema);

module.exports = Pedido; //Permitimos a exportação do model para outros arquivos, como no index.js
