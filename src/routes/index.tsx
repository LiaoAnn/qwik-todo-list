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
import { QwikLogo } from "../components/icons/qwik";
import { v4 } from "uuid";

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

export const TODOS = createContext<ToDos>("ToDoApp");

export default component$(() => {
	const todos = useStore<ToDos>({
		items: [
			{
				id: v4(),
				completed: true,
				title: "1. Learn Qwik",
				created_at: Date.now(),
				completed_at: Date.now()
			}, {
				id: v4(),
				completed: true,
				title: "2. Learn Next.js",
				created_at: Date.now()
			}, {
				id: v4(),
				completed: true,
				title: "3. Finish ToDo App with Qwik",
				created_at: Date.now(),
				completed_at: Date.now()
			}, {
				id: v4(),
				completed: true,
				title: "4. Finish ToDo App with Next.js",
				created_at: Date.now()
			}, {
				id: v4(),
				completed: false,
				title: "5. Compare ToDo App with Qwik and Next.js",
				created_at: Date.now()
			}, {
				id: v4(),
				completed: false,
				title: "6. Write a blog post about it",
				created_at: Date.now(),
				completed_at: Date.now()
			}, {
				id: v4(),
				completed: false,
				title: "7. Get A+ on the 資工導論🥲",
				created_at: Date.now()
			}
		]
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
								pxTop={index * 76}
								editing={todo.isNew || false}
							>
							</Item>
						))
				}
			</ul>
			<Navigation></Navigation>
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
		<li class={{ complete: prop.item.completed, editing: state.editing }} style={{ top: `${prop.pxTop}px` }}>
			<div className="view">
				<input
					type="checkbox"
					class="toggle"
					checked={prop.item.completed}
					onChange$={(e: any) => {
						const checked = (e.target as HTMLInputElement).checked;
						prop.item.completed = checked;
						if (checked) {
							prop.item.completed_at = Date.now();
						} else {
							delete prop.item.completed_at;
						}
					}}
				/>
				<label onDblClick$={() => state.editing = true}>{prop.item.title}</label>
				<button
					class="destroy"
					onClick$={() => {
						todos.items = todos.items.filter(todo => todo.title != prop.item.title)
					}}
				></button>
			</div>

			{state.editing ? (
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
				/>) :
				<></>
			}
		</li>
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
