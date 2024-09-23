import { isValidCPF, isCPFExists, isValidEmail, isEmailExists } from './validationHelpers'; // Supondo que você tenha helpers

export const validateCPF = async (cpf: string, setError: React.Dispatch<React.SetStateAction<boolean>>, setExistsError: React.Dispatch<React.SetStateAction<boolean>>) => {
  if (!isValidCPF(cpf)) {
    setError(true);
    setExistsError(false);
  } else {
    setError(false);
    const exists = await isCPFExists(cpf);
    setExistsError(exists);
  }
};

export const validateEmail = async (email: string, setError: React.Dispatch<React.SetStateAction<boolean>>, setExistsError: React.Dispatch<React.SetStateAction<boolean>>) => {
  if (!isValidEmail(email)) {
    setError(true);
  } else {
    setError(false);
    const exists = await isEmailExists(email);
    setExistsError(exists);
  }
};
export { isValidCPF, isEmailExists, isValidEmail, isCPFExists };

