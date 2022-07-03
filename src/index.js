const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find(user => user.username === username);
  if(!user){
    return response.status(404).json({ error: 'User not found'})
  }

  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const hasUser = users.some(user => user.username === username);
  if(hasUser){
    return response.status(400).json({ error: 'Username already exists'})
  }

  const user = { 
    id: uuidv4(),
    name, 
    username, 
    todos: []
  }
  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  return response.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user, body } = request;
  const todo = {
    id: uuidv4(),
    title: body.title,
    done: false,
    deadline: new Date(body.deadline),
    created_at: new Date()
  }
  user.todos.push(todo)
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user, body, params } = request;
  const find = user.todos.find(todo => todo.id === params.id);
  if(!find){
    return response.status(404).json({ error: 'Todo not found'})
  }
  const update = user.todos.map(todo => {
    if (todo.id === params.id){
      return {
        ...todo,
        title: body.title,
        deadline: new Date(body.deadline)
      }
    } 

    return todo
  });
  user.todos = [...update];
  return response.json(update.find(todo => todo.id === params.id));
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user, params } = request;
  const todo = user.todos.find(todo => todo.id === params.id);
  if(!todo){
    return response.status(404).json({ error: 'Todo not found'})
  }
  
  const update = user.todos.map(todo => {
    if (todo.id === params.id){
      return {
        ...todo,
        done: true
      }
    } 

    return todo
  });

  user.todos = [...update];
  return response.json(update.find(todo => todo.id === params.id));
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user, body, params } = request;
  const find = user.todos.find(todo => todo.id === params.id);
  if(!find){
    return response.status(404).json({ error: 'Todo not found'})
  }

  user.todos.splice(find, 1);

  return response.status(204).json(user.todos);
});

module.exports = app;