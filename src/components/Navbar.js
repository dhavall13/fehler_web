import React from 'react';
import {
  Box,
  Flex,
  Avatar,
  HStack,
  Link,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  Heading,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { useParams } from 'react-router-dom';

const NavLink = props => (
  <Link
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
    as={RouterLink}
    to={props.url}
  >
    {props.children}
  </Link>
);

export const Navbar = props => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const Links = [
    { name: 'Projects', url: `/${props.spaceName}/projects` },
    { name: 'People', url: `/${props.spaceName}/people` },
  ];

  if (props.projectName) {
    Links.push({
      name: 'Risks',
      url: `/${props.spaceName}/${props.projectName}/risks`,
    });
    Links.push({
      name: 'Risk Matrix',
      url: `/${props.spaceName}/${props.projectName}/risk-matrix`,
    });
  }

  return (
    <Box px="8" boxShadow="md">
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <IconButton
          size={'md'}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={'Open Menu'}
          display={{ md: !isOpen ? 'none' : 'inherit' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems={'center'}>
          <Box>
            <Heading fontSize={['24px']} fontWeight="bold" color="#70bae7">
              Fehler
            </Heading>
          </Box>
          <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
            {Links.map(link => (
              <NavLink key={link.name} url={link.url}>
                {link.name}
              </NavLink>
            ))}
          </HStack>
          <Button
            onClick={props.onOpen}
            variant={'solid'}
            colorScheme={'teal'}
            size={'sm'}
            mr={4}
          >
            Create
          </Button>
        </HStack>
        <Flex alignItems={'center'}>
          <Menu>
            <MenuButton
              as={Button}
              rounded={'full'}
              variant={'link'}
              cursor={'pointer'}
            >
              <Avatar
                size={'sm'}
                // src={
                //   'https://images.unsplash.com/photo-1493666438817-866a91353ca9?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9'
                // }
                // name="Vivek Gandharkar"
              />
            </MenuButton>
            <MenuList>
              <MenuItem>Link 1</MenuItem>
              <MenuItem>Link 2</MenuItem>
              <MenuDivider />
              <MenuItem>Link 3</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4}>
          <Stack as={'nav'} spacing={4}>
            {Links.map(link => (
              <NavLink key={link}>{link}</NavLink>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
};
