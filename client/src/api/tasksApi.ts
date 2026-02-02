import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Task, CreateTaskDto, UpdateTaskDto } from '../types';

const nowSeconds = () => Math.floor(Date.now() / 1000);

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Task'],
  endpoints: (builder) => ({
    // Get all tasks
    getTasks: builder.query<Task[], void>({
      query: () => '/tasks',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Task' as const, id })),
              { type: 'Task', id: 'LIST' },
            ]
          : [{ type: 'Task', id: 'LIST' }],
    }),

    // Get a single task by ID
    getTaskById: builder.query<Task, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Task', id }],
    }),

    // Create a new task
    createTask: builder.mutation<Task, CreateTaskDto>({
      query: (newTask) => ({
        url: '/tasks',
        method: 'POST',
        body: newTask,
      }),
      async onQueryStarted(newTask, { dispatch, queryFulfilled }) {
        // Optimistically add a temporary task to the list.
        // If the request fails, undo. If it succeeds, replace temp with server task.
        const tempId = `temp-${Date.now()}`;
        const optimisticNow = nowSeconds();
        const patchResult = dispatch(
          tasksApi.util.updateQueryData('getTasks', undefined, (draft) => {
            draft.unshift({
              id: tempId,
              title: newTask.title,
              description: newTask.description ?? '',
              status: newTask.status ?? 'todo',
              priority: newTask.priority ?? undefined,
              dueDate: newTask.dueDate ?? undefined,
              createdAt: optimisticNow,
              updatedAt: optimisticNow,
            });
          })
        );

        try {
          const { data: created } = await queryFulfilled;
          dispatch(
            tasksApi.util.updateQueryData('getTasks', undefined, (draft) => {
              const idx = draft.findIndex((t) => t.id === tempId);
              if (idx !== -1) {
                draft[idx] = created;
              }
            })
          );
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: [{ type: 'Task', id: 'LIST' }],
    }),

    // Update a task
    updateTask: builder.mutation<Task, { id: string; updates: UpdateTaskDto }>({
      query: ({ id, updates }) => ({
        url: `/tasks/${id}`,
        method: 'PUT',
        body: updates,
      }),
      async onQueryStarted({ id, updates }, { dispatch, queryFulfilled }) {
        const patchList = dispatch(
          tasksApi.util.updateQueryData('getTasks', undefined, (draft) => {
            const existing = draft.find((t) => t.id === id);
            if (existing) {
              Object.assign(existing, updates);
              if ('dueDate' in updates && updates.dueDate === null) delete (existing as any).dueDate;
              if ('priority' in updates && updates.priority === null) delete (existing as any).priority;
              existing.updatedAt = nowSeconds();
            }
          })
        );

        const patchById = dispatch(
          tasksApi.util.updateQueryData('getTaskById', id, (draft) => {
            Object.assign(draft, updates);
            if ('dueDate' in updates && updates.dueDate === null) delete (draft as any).dueDate;
            if ('priority' in updates && updates.priority === null) delete (draft as any).priority;
            draft.updatedAt = nowSeconds();
          })
        );

        try {
          const { data: updated } = await queryFulfilled;
          dispatch(
            tasksApi.util.updateQueryData('getTasks', undefined, (draft) => {
              const idx = draft.findIndex((t) => t.id === id);
              if (idx !== -1) draft[idx] = updated;
            })
          );
          dispatch(tasksApi.util.updateQueryData('getTaskById', id, (draft) => Object.assign(draft, updated)));
        } catch {
          patchList.undo();
          patchById.undo();
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
    }),

    // Delete a task
    deleteTask: builder.mutation<{ message: string; id: string }, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchList = dispatch(
          tasksApi.util.updateQueryData('getTasks', undefined, (draft) => {
            const idx = draft.findIndex((t) => t.id === id);
            if (idx !== -1) draft.splice(idx, 1);
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchList.undo();
        }
      },
      invalidatesTags: (_result, _error, id) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;
