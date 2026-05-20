import { Card, Flex, Grid, Text } from '@radix-ui/themes';

export function ContactInfoCards() {
  return (
    <Grid columns='2' gap='3' mt='5'>
      <Card>
        <Flex direction='column' gap='1'>
          <Text weight='bold'>조인하와이 현지 연락처</Text>
          <Text>T : (808) 772-2691</Text>
          <Text>카톡 : joinhawaiiusa</Text>
          <Text>시간 : 08AM ~ 17PM</Text>
        </Flex>
      </Card>
      <Card>
        <Flex direction='column' gap='1'>
          <Text weight='bold'>조인하와이 한국 연락처</Text>
          <Text>T : 02-402-1040</Text>
          <Text>카톡 : 조인하와이(채널)</Text>
          <Text>시간 : 09AM ~ 18PM</Text>
        </Flex>
      </Card>
    </Grid>
  );
}
