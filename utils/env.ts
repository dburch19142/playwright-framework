function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. Copy .env.example to .env and fill it in.`);
  }
  return value;
}

export const testUser = {
  get email() {
    return required('TEST_USER');
  },
  get password() {
    return required('TEST_PASS');
  },
};
