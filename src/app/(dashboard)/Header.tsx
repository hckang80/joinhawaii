import { Button, Flex, Link } from '@radix-ui/themes';

export default function Header() {
  return (
    <header>
      <Flex justify='end' gap='2' p='4'>
        <Link>login</Link>
        <Button variant='ghost' size='3'>
          logout
        </Button>
      </Flex>
    </header>
  );
}
