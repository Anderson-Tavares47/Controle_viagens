"use client";

import React from 'react';
import styles from './styles.module.css';
import { useForm, Controller } from 'react-hook-form';
import InputMask from 'react-input-mask-next';

const DriverForm = () => {
  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      name: "",
      cnh: "",
      phone1: "",
      phone2: "",
      address: "",
      cpf: "",
      rg: "",
    },
  });

  const onSubmit = (data) => {
    // Obter a lista de motoristas do localStorage ou criar uma lista vazia
    const existingDrivers = JSON.parse(localStorage.getItem('drivers')) || [];

    // Adicionar o novo motorista à lista
    const updatedDrivers = [...existingDrivers, data];

    // Salvar a lista atualizada no localStorage
    localStorage.setItem('drivers', JSON.stringify(updatedDrivers));

    alert('Motorista adicionado com sucesso!');
    
    // Resetar o formulário após a submissão
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={styles['form-row']}>
        <label>
          Nome:
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                placeholder="Nome"
                {...field}
              />
            )}
          />
        </label>
      </div>

      <div className={styles['form-row']}>
        <label>
          CNH:
          <Controller
            name="cnh"
            control={control}
            render={({ field }) => (
              <InputMask
                mask="99999999999"
                placeholder="CNH"
                {...field}
              />
            )}
          />
        </label>
      </div>

      <div className={styles['form-row']}>
        <label>
          Telefone 1:
          <Controller
            name="phone1"
            control={control}
            render={({ field }) => (
              <InputMask
                mask="(99) 99999-9999"
                placeholder="Telefone 1"
                {...field}
              />
            )}
          />
        </label>
      </div>

      <div className={styles['form-row']}>
        <label>
          Telefone 2:
          <Controller
            name="phone2"
            control={control}
            render={({ field }) => (
              <InputMask
                mask="(99) 99999-9999"
                placeholder="Telefone 2"
                {...field}
              />
            )}
          />
        </label>
      </div>

      <div className={styles['form-row']}>
        <label>
          Endereço Completo:
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                placeholder="Endereço Completo"
                {...field}
              />
            )}
          />
        </label>
      </div>

      <div className={styles['form-row']}>
        <label>
          CPF:
          <Controller
            name="cpf"
            control={control}
            render={({ field }) => (
              <InputMask
                mask="999.999.999-99"
                placeholder="CPF"
                {...field}
              />
            )}
          />
        </label>
      </div>

      <div className={styles['form-row']}>
        <label>
          RG:
          <Controller
            name="rg"
            control={control}
            render={({ field }) => (
              <InputMask
                mask="99.999.999.99"
                placeholder="RG"
                {...field}
              />
            )}
          />
        </label>
      </div>

      <div className={styles['button-row']}>
        <button type="submit">Adicionar Motorista</button>
      </div>
    </form>
  );
};

export default DriverForm;
