import { CONTACT_NUMBER } from '@/constants';
import { Box, Card, Flex, Grid, Text } from '@radix-ui/themes';

export function ContactInfoCards() {
  return (
    <Grid columns='2' gap='3' mt='4'>
      <Card>
        <Box>
          <Flex gap='1' align='end'>
            <Text weight='bold'>한국</Text>
            <Text size='1'>(09 AM - 06 PM 공휴일 휴무)</Text>
          </Flex>
        </Box>
        <Box>
          <Flex gap='1'>
            <Text weight='bold'>T.</Text>
            <Text>{CONTACT_NUMBER}</Text>
            <Text>/</Text>
            <Text weight='bold'>카카오톡채널.</Text>
            <Text>조인하와이</Text>
          </Flex>
        </Box>
      </Card>
      <Card>
        <Box>
          <Flex gap='1' align='end'>
            <Text weight='bold'>하와이</Text>
            <Text size='1'>(08 AM - 06 PM 공휴일 휴무)</Text>
          </Flex>
        </Box>
        <Box>
          <Flex gap='1'>
            <Text weight='bold'>T.</Text>
            <Text>1 808 772 2691</Text>
            <Text>/</Text>
            <Text weight='bold'>카카오톡ID.</Text>
            <Text>Joinhawaiiusa</Text>
          </Flex>
        </Box>
      </Card>
    </Grid>
  );
}
