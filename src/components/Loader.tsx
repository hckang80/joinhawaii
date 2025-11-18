import { Flex, Spinner } from '@radix-ui/themes';

export function Loader() {
  return (
    <Flex justify='center' align='center' minHeight='500px'>
      <Spinner size='3' />
    </Flex>
  );
}
