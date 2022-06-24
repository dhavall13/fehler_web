import React from 'react';
import {
  Box,
  HStack,
  useDisclosure,
  Stack,
  Text,
  Wrap,
  WrapItem,
  Avatar,
} from '@chakra-ui/react';
import axios from 'axios';
import { DragDropContext } from 'react-beautiful-dnd';
import { QueryCache, useMutation, useQuery, useQueryClient } from 'react-query';
import Column from '../components/Column';
import { Navbar } from '../components/Navbar';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { CreateIssueModal } from '../components/modals/CreateIssueModal';
import { useAuth } from '../contexts/auth/authContext';
import IssueDetailsModal from '../components/modals/IssueDetailsModal';

function fetchColumns(spaceName, projectName, token) {
  return axios.get(
    `http://127.0.0.1:8000/api/${spaceName}/${projectName}/columns/`,
    {
      headers: { Authorization: `Token ${token}` },
    }
  );
}
function fetchProject(spaceName, projectName, token) {
  return axios.get(
    `http://127.0.0.1:8000/api/spaces/${spaceName}/projects/${projectName}/`,
    {
      headers: { Authorization: `Token ${token}` },
    }
  );
  // .then(response => response.data);
}

// When `Kanban` page is directly accessed with url, state object (state: { id: project.id, projectName: project.name }) is not passed through router.
function Kanban(props) {
  console.log(props.location.state);
  const token = window.localStorage.getItem('userToken');
  const params = useParams();
  const createIssueModalDisclosure = useDisclosure();
  const issueDetailsModalDisclosure = useDisclosure();
  const [clickedTask, setClickedTask] = React.useState(null);

  const { userData } = useAuth();
  const user = userData.currentUser;
  const project = useQuery([params.spaceName, params.projectName, 'info'], () =>
    fetchProject(params.spaceName, params.projectName, token)
  );

  const query = useQuery(
    [params.spaceName, params.projectName, 'columns'],
    () => fetchColumns(params.spaceName, params.projectName, token)
  );
  const queryClient = useQueryClient();
  const reorderTasks = useMutation(
    newOrder =>
      axios.post(`http://127.0.0.1:8000/api/reorder-tasks/`, newOrder),
    {
      // onSuccess: data => {
      //   const columns = data?.data.columns;
      //   const tasks = data?.data.tasks;

      //   queryClient.setQueriesData('columns', oldQueryData => {
      //     return { ...oldQueryData, data: [...columns] };
      //   });
      //   queryClient.setQueriesData(['tasks', 1], oldQueryData => {
      //     return { ...oldQueryData, data: [...tasks] };
      //   });
      // },

      onMutate: async newOrder => {
        await queryClient.cancelQueries([
          params.spaceName,
          params.projectName,
          'columns',
        ]);
        await queryClient.cancelQueries(['tasks', query.data?.data[0].board]);

        queryClient.setQueryData(
          [params.spaceName, params.projectName, 'columns'],
          oldColumnsData => {
            if (
              newOrder.source_droppable_id === newOrder.destination_droppable_id
            ) {
              console.log(oldColumnsData.data);
              const columnIndex = oldColumnsData.data.findIndex(
                col => col.id === newOrder.source_droppable_id
              );
              const column = oldColumnsData.data[columnIndex];

              const newTaskIds = Array.from(column.tasks);

              // move the taskId from its old index to its new index.

              // from the index(source.index) remove one item.
              newTaskIds.splice(newOrder.source_index, 1);

              // from destination index remove nothing and insert draggableId.
              newTaskIds.splice(
                newOrder.destination_index,
                0,
                newOrder.task_id
              );

              // create new column
              const newColumn = { ...column, tasks: newTaskIds };

              console.log('newCol', newColumn);

              const newData = [...oldColumnsData.data];

              newData.splice(columnIndex, 1, newColumn);

              console.log(newData);

              return {
                ...oldColumnsData,
                data: newData,
              };
            } else {
              console.log('newordr', newOrder);
              console.log(oldColumnsData.data);
              const startColumnIndex = oldColumnsData.data.findIndex(
                col => col.id === newOrder.source_droppable_id
              );
              const endColumnIndex = oldColumnsData.data.findIndex(
                col => col.id === newOrder.destination_droppable_id
              );

              console.log('startColumnIndex', startColumnIndex);
              console.log('endColumnIndex', endColumnIndex);
              const startColumn = oldColumnsData.data[startColumnIndex];
              const endColumn = oldColumnsData.data[endColumnIndex];

              const startTaskIds = Array.from(startColumn.tasks);

              // remove the dragged task from startTaskIds
              startTaskIds.splice(newOrder.source_index, 1);

              // create copy of taskIds array of end column
              const endTaskIds = Array.from(endColumn.tasks);

              // add the dropped task to endTaskIds
              endTaskIds.splice(
                newOrder.destination_index,
                0,
                newOrder.task_id
              );

              const newStartColumn = { ...startColumn, tasks: startTaskIds };
              const newEndColumn = { ...endColumn, tasks: endTaskIds };

              const newData = [...oldColumnsData.data];

              newData.splice(startColumnIndex, 1, newStartColumn);
              newData.splice(endColumnIndex, 1, newEndColumn);

              console.log('newData', newData);
              return {
                ...oldColumnsData,
                data: newData,
              };
            }
          }
        );
      },
      onError: (_error, _newOrder, context) => {
        queryClient.setQueriesData(
          [params.spaceName, params.projectName, 'columns'],
          context.oldColumnsData
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries([
          params.spaceName,
          params.projectName,
          'columns',
        ]);
        queryClient.invalidateQueries(['tasks', query.data?.data[0].board]);
      },
    }
  );

  if (query.isLoading || project.isLoading) {
    return <div>Loading...</div>;
  }

  console.log('project infor', project.data.data);

  function onDragEnd(result) {
    // console.log('ondragend');

    // console.log('result', result);

    const { destination, source, draggableId } = result;

    console.log(result);

    if (!destination) {
      return;
    }

    // the location of the draggable was not changed.
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // console.log('source.index', source.index);
    // console.log('destination.index', destination.index);
    reorderTasks.mutate({
      source_index: source.index,
      source_droppable_id: parseInt(source.droppableId.slice(7)),
      destination_index: destination.index,
      destination_droppable_id: parseInt(destination.droppableId.slice(7)),
      task_id: parseInt(draggableId.slice(5)),
    });
  }

  return (
    <Box>
      <Navbar
        spaceName={project.data.data.space}
        user={user}
        onOpen={createIssueModalDisclosure.onOpen}
        projectName={params.projectName}
      />
      <CreateIssueModal
        user={user}
        spaceName={project.data.data.space}
        projects={[
          {
            id: project.data.data.id,
            name: project.data.data.name,
          },
        ]}
        isOpen={createIssueModalDisclosure.isOpen}
        onOpen={createIssueModalDisclosure.onOpen}
        onClose={createIssueModalDisclosure.onClose}
      />
      <IssueDetailsModal
        task={clickedTask}
        spaceName={project.data.data.space}
        user={user}
        projects={[
          {
            id: project.data.data.id,
            name: project.data.data.name,
          },
        ]}
        isOpen={issueDetailsModalDisclosure.isOpen}
        onOpen={issueDetailsModalDisclosure.onOpen}
        onClose={issueDetailsModalDisclosure.onClose}
      />
      <Box p={16}>
        <Wrap>
          <WrapItem>
            <Stack direction="row" alignItems="center" spacing="4">
              <Avatar
                size="lg"
                bg="#E87D65"
                color="#fff"
                name={project.data.data.name}
              />
              <Text fontWeight="semibold">{project.data.data.name}</Text>
            </Stack>
          </WrapItem>
        </Wrap>
        <Box px={8}>
          <Box py={8}>
            <Text fontSize="26px">Kanban Board</Text>
          </Box>
          <DragDropContext onDragEnd={onDragEnd}>
            <HStack spacing={10} alignItems="flex-start">
              {query.data?.data.map(column => (
                <Column
                  setClickedTask={setClickedTask}
                  onOpen={issueDetailsModalDisclosure.onOpen}
                  key={column.id}
                  column={column}
                />
              ))}
            </HStack>
          </DragDropContext>
        </Box>
      </Box>
    </Box>
  );
}
export default Kanban;
