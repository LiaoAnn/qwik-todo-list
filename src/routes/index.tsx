import {
	component$,
	useRef,
	useStore,
	useWatch$,
	createContext,
	useContextProvider,
	useContext
} from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { EditIcon } from '~/components/icons/feather-edit';
import { TrashIcon } from '~/components/icons/feather-trash';
import { QwikLogo } from "../components/icons/qwik";
import { v4 } from "uuid";
import jsonTodo from "../todos.json";

type ToDos = {
	items: ToDoItem[]
}

type ToDoItem = {
	id: string;
	completed: boolean;
	title: string;
	description?: string;
	created_at: number;
	completed_at?: number;
	isNew?: boolean;
}

type jsonTodo = {
	title: string;
	completed: boolean;
}

export const TODOS = createContext<ToDos>("ToDoApp");
export const jsonTodos = jsonTodo
	.map((todo: jsonTodo) => ({
		...todo,
		id: v4(),
		created_at: Date.now()
	}))

export default component$(() => {
	const todos = useStore<ToDos>({
		items: jsonTodos
	}, { recursive: true });
	useContextProvider(TODOS, todos);
	const imcomplete = todos.items
		.filter(todo => !todo.completed)
		.sort((a, b) => (b.created_at - a.created_at))
	const complete = todos.items
		.filter(todo => todo.completed)
		.sort((a, b) => b.completed_at! - a.completed_at!)


	return (
		<div class="main">
			<QwikLogo />
			<ul class="todo-list">
				{
					[...imcomplete, ...complete]
						.map((todo, index) => (
							<Item
								key={todo.title}
								item={todo}
								pxTop={index * 54}
								editing={todo.isNew || false}
							>
							</Item>
						))
				}
			</ul>
			<Navigation />
		</div>
	);
});

export type Prop = {
	item: ToDoItem;
	pxTop: number;
	editing?: boolean;
}

export const Item = component$((prop: Prop) => {
	const state = useStore({ editing: prop.editing || false });
	const editInput = useRef<HTMLInputElement>();
	const todos = useContext(TODOS);

	useWatch$(({ track }) => {
		// const current = track(editInput, "current");
		const current = track(() => editInput.current);
		if (current) {
			current.focus();
			current.selectionStart = current.selectionEnd = current.value.length;
		}
	})

	return (
		<li class={{ completed: prop.item.completed, editing: state.editing }} style={{ top: `${prop.pxTop}px` }}>
			<div className="view">
				{
					state.editing ? (
						<input
							class="edit"
							ref={editInput}
							value={prop.item.title}
							onBlur$={() => {
								state.editing = false;
							}}
							onkeydown$={(e: any) => {
								switch (e.keyCode) {
									case 27:
										state.editing = false;
										break;
									case 13:
										prop.item.title = (e.target as HTMLInputElement).value;
										state.editing = false;
										break;
								}
							}}
						/>
					) :
						<>
							<label>
								<input
									type="checkbox"
									class="toggle"
									checked={prop.item.completed}
									onChange$={(e: any) => {
										const checked = (e.target as HTMLInputElement).checked;
										setTimeout(() => {
											prop.item.completed = checked;
											if (checked) {
												prop.item.completed_at = Date.now();
											} else {
												delete prop.item.completed_at;
											}
										}, 300);
									}}
								/>
								<span>
									{prop.item.title}
								</span>
							</label>
							<div className="actions">
								<button onClick$={() => { state.editing = true }}>
									<EditIcon />
								</button>
								<button onClick$={() => { todos.items = todos.items.filter(todo => todo.id != prop.item.id) }}>
									<TrashIcon />
								</button>
							</div>
						</>
				}
			</div>
		</li >
	)
})

export const head: DocumentHead = {
	title: 'ToDo List with Qwik',
	meta: [
		{
			name: 'description',
			content: 'This is a cool ToDo List!',
		},
	],
};

export const Navigation = component$(() => {
	const todos = useContext(TODOS);
	return (
		<div className="navigation">
			<button
				onClick$={() => {
					todos.items.push({
						id: v4(),
						completed: false,
						title: "New Item",
						created_at: Date.now(),
						isNew: true
					});
				}}
			>
				Add New Task
			</button>
		</div>
	)
})
