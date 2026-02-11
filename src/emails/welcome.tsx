import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Button,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  name: string;
}

export default function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to The Gold Metrics Vault</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>The Gold Metrics</Heading>
          <Text style={text}>Hello {name},</Text>
          <Text style={text}>
            Your institutional vault is ready. You now have access to real-time
            gold analytics and the $10k Practice Simulator.
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href="https://thegoldmetrics.com/dashboard">
              Access Your Vault
            </Button>
          </Section>
          <Text style={footer}>
            Automated via The Gold Metrics Infrastructure.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#FDFBF7',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const h1 = {
  color: '#D4AF37',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const text = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '26px',
};

const btnContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#D4AF37',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
};

const footer = {
  color: '#898989',
  fontSize: '12px',
  marginTop: '24px',
  textAlign: 'center' as const,
};
