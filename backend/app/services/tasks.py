from fastapi import BackgroundTasks


class TaskDispatcher:
    """Thin abstraction to keep a future Celery migration straightforward."""

    @staticmethod
    def dispatch(background_tasks: BackgroundTasks, func, *args, **kwargs) -> None:
        background_tasks.add_task(func, *args, **kwargs)


task_dispatcher = TaskDispatcher()
