import React from 'react';
import { Box, Text, HStack, Avatar, Tag, TagLabel } from '@chakra-ui/react';
import { Draggable } from 'react-beautiful-dnd';

const taskPriority = {
  1: { color: 'green.400' },
  2: { color: 'yellow.400' },
  3: { color: 'orange.400' },
  4: { color: 'red.400' },
};

function Task({ task, index, onOpen, setClickedTask }) {
  // const taskDateDue = new Date(task.date_due).toLocaleDateString('en-US', {
  //   year: 'numeric',
  //   month: 'long',
  //   day: 'numeric',
  // });
  return (
    <Draggable draggableId={`task-${task.id}`} index={index}>
      {(provided, snapshot) => (
        <Box
          onClick={() => {
            setClickedTask(task);
            onOpen();
          }}
          borderTop="8px"
          borderStyle="solid"
          borderColor={taskPriority[task.priority].color}
          borderRadius="md"
          py={2}
          px={4}
          fontSize="14px"
          boxShadow="md"
          bgColor={snapshot.isDragging ? 'blue.50' : 'white'}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Text fontWeight="medium">{task.name}</Text>
          <HStack my={2} alignItems="center">
            <Avatar name={task.reporter_name} size="xs" />
            <Text fontSize="12px">
              {new Date(task.date_due).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </HStack>
          <HStack spacing={2}>
            {task.tags.map((tag, index) => (
              <Tag
                size="sm"
                my={1}
                py={1}
                px={2}
                variant="subtle"
                colorScheme="purple"
                key={index}
              >
                <TagLabel fontSize={9}>{tag}</TagLabel>
              </Tag>
            ))}
          </HStack>
        </Box>
      )}
    </Draggable>
  );
}

export default Task;
