import React from 'react';
import { Box, Heading, Stack } from '@chakra-ui/react';
import { useQuery } from 'react-query';
import axios from 'axios';
import Task from './Task';
import { Droppable } from 'react-beautiful-dnd';
import { useParams } from 'react-router-dom';

function fetchTasks(boardId, spaceName, projectName) {
  return axios.get(
    `http://127.0.0.1:8000/api/spaces/${spaceName}/projects/${projectName}/boards/${boardId}/tasks/`
  );
}

function Column({ column, onOpen, setClickedTask }) {
  const params = useParams();
  const query = useQuery(
    ['tasks', params.spaceName, params.projectName, column.board],
    () => fetchTasks(column.board, params.spaceName, params.projectName)
  );

  if (query.isLoading) {
    return <div>Loading....</div>;
  }

  // const tasks = query.data?.data.filter(task => column.tasks.includes(task.id));
  const tasks = query.data?.data;

  // const tasks = column.tasks.

  // const tasks = query.data?.data.filter(task =>
  //   task.column === column.id ? task : null
  // );

  // console.log('tasks', tasks);

  return (
    <Box p={3} w={296} bgColor="#EFF1F2" borderRadius="md">
      <Heading
        fontFamily="Montserrat"
        mb="3"
        size="xs"
        textTransform="uppercase"
        fontWeight="medium"
      >
        {column.title}
      </Heading>
      <Stack spacing={4}>
        <Droppable droppableId={`column-${column.id}`}>
          {(provided, snapshot) => (
            <Stack
              spacing={4}
              transition={('bgColor', '0.2s', 'ease-in')}
              bgColor={snapshot.isDraggingOver ? 'gray.100' : null}
              ref={provided.innerRef} // used to supple the DOM node our component to react-beautifull-dnd
              {...provided.droppableProps}
            >
              {column.tasks.map((taskId, index) => {
                let task = tasks[tasks.findIndex(task => task.id === taskId)];
                console.log(task);
                if (typeof task !== 'undefined') {
                  return (
                    <Task
                      setClickedTask={setClickedTask}
                      onOpen={onOpen}
                      key={taskId}
                      task={task}
                      index={index}
                    />
                  );
                }
              })}
              {provided.placeholder}
            </Stack>
          )}
        </Droppable>
      </Stack>
    </Box>
  );
}

export default Column;
