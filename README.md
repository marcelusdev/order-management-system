# 🍕 Order Management System — Angular + Node.js + MongoDB + Socket.io

## 📦 Full-Stack Real-Time Order Management Application

This project is a complete order management system designed to simulate a real-world delivery environment, such as restaurants, pizzerias, and food services.

The application allows users to create orders, track their status, view detailed information, and receive real-time updates using **Socket.io**.

Built with **Angular on the frontend** and **Node.js + Express + MongoDB on the backend**, this project demonstrates full-stack integration, real-time communication, and a structured application architecture.

---

# PREVIEW

![HOME](screenshots/home.png)
![ORDER](screenshots/order.png)
![CLIENT](screenshots/client.png)
![CONTROL](screenshots/control.png)

---

# 🚀 Technologies

## 🧩 Frontend

* Angular (Standalone Components)
* TypeScript
* Bootstrap
* Custom CSS
* RxJS
* Socket.io Client
* FontAwesome

## ⚙️ Backend

* Node.js
* Express
* MongoDB Atlas
* Mongoose
* Socket.io Server
* CORS
* dotenv

---

# 🧠 Features

## 👨‍🍳 Order Creation

* Customer registration with validation.
* Product and flavor selection.
* Quantity management.
* Automatic cart calculation.
* Automatic order number generation.
* HTTP POST communication with backend.
* Success and error handling.

---

## 🏠 Orders Dashboard

* Displays all active orders.
* Smart search by:

  * Customer name;
  * Last name;
  * Order number.
* Status filtering.
* Text normalization for better searches.
* Real-time updates.

---

## 🎛️ Control Panel

* Complete order visualization.
* Order status updates.
* Backend communication through HTTP PUT.
* Automatic synchronization using Socket.io.

---

## 📋 Order Details

* Complete order information.
* Dynamic status styling.
* Angular bindings and `ngClass` usage.

---

# 🔄 Real-Time Communication with Socket.io

Socket.io enables instant communication between connected users.

Whenever an order is created or updated:

1. The frontend sends a request.
2. The backend processes the data.
3. MongoDB stores the information.
4. Socket.io broadcasts the update.
5. All connected clients receive the change instantly.

---

# 🧱 Project Structure

```text
sistema-pedidos/
│
├── backend/
│   ├── models/
│   ├── index.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── src/
├── public/
├── angular.json
├── package.json
└── README.md
```

---

# ⚙️ Installation

## Backend

Navigate to backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create your `.env` file based on `.env.example`:

```env
MONGO_URI=your_mongodb_connection_string
PORT=3000
FRONTEND_URL=http://localhost:4200
```

Run:

```bash
npm start
```

Backend runs on:

```text
http://localhost:3000
```

---

## Frontend

From the project root:

```bash
npm install
```

Run:

```bash
ng serve
```

Frontend runs on:

```text
http://localhost:4200
```

---

# 🔐 Environment Variables

Sensitive information is not stored directly in the source code.

The project uses:

* `.env` → local private configuration.
* `.env.example` → public configuration template.

---

# 🌟 Skills Demonstrated

* Full-stack application architecture.
* Angular standalone components.
* Backend API development.
* MongoDB integration.
* Real-time communication with Socket.io.
* RxJS reactive programming.
* Environment variable management.
* Git and GitHub best practices.

---

# 🛠️ Future Improvements

* Authentication system.
* User management.
* Order history.
* Administrative reports.
* Automatic notifications.

---

# 👨‍💻 Author

**Marcelo Eduardo**

Full-stack portfolio project focused on modern web development, system integration, and clean architecture.












<!-- README VERSÃO PORTUGUÊS-->

# 🍕 Sistema de Pedidos — Angular + Node.js + MongoDB + Socket.io

## 📦 Sistema Full-Stack com Atualização em Tempo Real

Este projeto é um sistema completo de gerenciamento de pedidos desenvolvido para simular o funcionamento de um ambiente real de delivery (como pizzarias, restaurantes ou lanchonetes).

A aplicação permite criar pedidos, acompanhar seu status, visualizar informações detalhadas e sincronizar todas as alterações em tempo real utilizando **Socket.io**.

Construído com **Angular no frontend** e **Node.js + Express + MongoDB no backend**, o projeto demonstra integração full-stack, comunicação em tempo real e organização de arquitetura entre cliente, servidor e banco de dados.

---

# 🚀 Tecnologias Utilizadas

## 🧩 Frontend

* Angular (Standalone Components)
* TypeScript
* Bootstrap
* CSS personalizado
* RxJS
* Socket.io Client
* FontAwesome

## ⚙️ Backend

* Node.js
* Express
* MongoDB Atlas
* Mongoose
* Socket.io Server
* CORS
* dotenv

---

# 🧠 Funcionalidades

## 👨‍🍳 Criação de Pedidos

* Cadastro de cliente com validações de nome e sobrenome.
* Escolha de produtos e sabores.
* Controle de quantidade dos itens.
* Carrinho com cálculo automático.
* Geração automática do número do pedido.
* Envio dos dados para o backend via HTTP POST.
* Tratamento de mensagens de erro e sucesso.

---

## 🏠 Painel de Pedidos

* Listagem dos pedidos recebidos.
* Busca inteligente por:

  * Nome;
  * Sobrenome;
  * Número do pedido.
* Filtro por status.
* Normalização de textos para buscas com diferentes acentos.
* Atualização automática em tempo real.

---

## 🎛️ Painel de Controle

* Visualização completa dos pedidos.
* Alteração de status do pedido.
* Atualização enviada ao backend via HTTP PUT.
* Sincronização instantânea com todos os usuários conectados.

---

## 📋 Detalhes do Pedido

* Exibição completa das informações.
* Status com estilização dinâmica.
* Animações e alterações visuais utilizando Angular (`ngClass` e bindings).

---

# 🔄 Comunicação em Tempo Real com Socket.io

O Socket.io permite que todos os usuários conectados recebam alterações instantaneamente.

Quando um pedido é criado ou atualizado:

1. O frontend envia a requisição para o backend.
2. O backend salva ou altera os dados no MongoDB.
3. O servidor dispara um evento através do Socket.io.
4. Todos os clientes conectados recebem a atualização automaticamente.

Dessa forma, não é necessário atualizar a página manualmente.

---

# 🧱 Estrutura do Projeto

```text
sistema-pedidos/
│
├── backend/
│   ├── models/
│   │   └── Pedido.js
│   ├── index.js
│   ├── package.json
│   ├── package-lock.json
│   ├── .env.example
│   └── .gitignore
│
├── src/
├── public/
├── angular.json
├── package.json
├── package-lock.json
└── README.md
```

---

# ⚙️ Instalação e Execução

## Backend

Entre na pasta:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` baseado no `.env.example`:

```env
MONGO_URI=sua_string_de_conexao_mongodb
PORT=3000
FRONTEND_URL=http://localhost:4200
```

Execute:

```bash
npm start
```

O backend será iniciado em:

```text
http://localhost:3000
```

---

## Frontend

Na raiz do projeto:

```bash
npm install
```

Execute:

```bash
ng serve
```

O frontend será iniciado em:

```text
http://localhost:4200
```

---

# 🔐 Variáveis de Ambiente

Informações sensíveis, como a conexão com o MongoDB, não são armazenadas diretamente no código.

O projeto utiliza:

* `.env` → arquivo local com informações privadas.
* `.env.example` → modelo público para configuração.

---

# 🌟 Aprendizados e Boas Práticas

* Arquitetura full-stack separando frontend, backend e banco.
* Uso de Angular Standalone Components.
* Serviços compartilhados para comunicação entre componentes.
* Uso de RxJS Observables.
* Integração de WebSocket com Socket.io.
* Configuração de variáveis de ambiente.
* Boas práticas de versionamento com Git.

---

# 🛠️ Próximas Melhorias

* Sistema de autenticação.
* Controle de usuários.
* Histórico de pedidos.
* Relatórios administrativos.
* Notificações automáticas.

---

# 👨‍💻 Autor

**Marcelo Eduardo**

Projeto desenvolvido para portfólio com foco em desenvolvimento Full-Stack, integração de tecnologias e boas práticas de programação.
