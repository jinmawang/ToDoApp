import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Todo } from './todo/entities/todo.entity';
import { User } from './user/entities/user.entity';

async function checkData() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const todoRepo = app.get('TodoRepository');
  const userRepo = app.get('UserRepository');

  console.log('\n=== 数据库中的所有用户 ===');
  const users = await userRepo.find({
    select: ['id', 'username', 'email']
  });
  console.table(users);

  console.log('\n=== 数据库中的所有 Todo ===');
  const todos = await todoRepo.find({
    relations: ['category', 'subtasks'],
    select: ['id', 'title', 'userId', 'priority', 'isCompleted', 'createdAt']
  });
  console.table(todos.map(t => ({
    id: t.id,
    title: t.title,
    userId: t.userId,
    priority: t.priority,
    completed: t.isCompleted,
    created: t.createdAt
  })));

  console.log('\n=== Todo 按用户分组 ===');
  const todosByUser = todos.reduce((acc, todo) => {
    if (!acc[todo.userId]) {
      acc[todo.userId] = [];
    }
    acc[todo.userId].push(todo);
    return acc;
  }, {} as Record<number, Todo[]>);

  for (const [userId, userTodos] of Object.entries(todosByUser)) {
    const user = users.find(u => u.id === Number(userId));
    console.log(`\n用户: ${user?.username || '未知'} (ID: ${userId})`);
    console.log(`  Todo 数量: ${userTodos.length}`);
    userTodos.forEach(todo => {
      console.log(`  - [${todo.id}] ${todo.title} (${todo.priority})`);
    });
  }

  await app.close();
}

checkData();
