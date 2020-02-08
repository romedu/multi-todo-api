exports.createTodoListTemplate = todoList => {
	const { name, todos, container } = todoList,
		newTodoListTemplate = `
            ${container ? container.name : ""}
            ${name}: 
            
            ${todos.map(todo => `• ${todo.description}`).join("\n")}
         `;

	return newTodoListTemplate;
};

module.exports = exports;
