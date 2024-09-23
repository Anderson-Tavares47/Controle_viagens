"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Modal from "react-modal";
import AddressForm from "@/components/motorista/page";
import base64String from "@/core/clients/base64/base64File";
import styles from "./styles.module.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Dashboard() {
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [driverData, setDriverData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const router = useRouter();

  const openAddressForm = () => {
    setIsAddressFormOpen(true);
  };

  const closeAddressForm = () => {
    setIsAddressFormOpen(false);
    updateDriverData(); // Chamar função para atualizar os dados após fechar o modal
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const updateDriverData = () => {
    const storedDriverData = JSON.parse(localStorage.getItem("drivers")) || [];
    setDriverData(storedDriverData);
  };

  // Recuperar o driverData do localStorage ao montar o componente
  useEffect(() => {
    updateDriverData();
  }, []);

  const exportToExcel = () => {
    const dataToExport = driverData.map((driver) => ({
      Nome: driver.name,
      CNH: driver.cnh,
      Telefone1: driver.phone1,
      Telefone2: driver.phone2,
      Endereço: driver.address,
      CPF: driver.cpf,
      RG: driver.rg,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Motoristas");
    XLSX.writeFile(wb, "motoristas.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF("portrait");
    doc.setFillColor("white");
    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, "F");

    const logoBase64 = base64String;

    doc.setGState(new doc.GState({ opacity: 0.2 }));
    doc.addImage(logoBase64, "PNG", 30, 20, 150, 120);

    doc.setGState(new doc.GState({ opacity: 1 }));
    autoTable(doc, {
      margin: { top: 10, right: 5, bottom: 10, left: 5 },
      head: [["Nome", "CNH", "Telefone1", "Telefone2", "Endereço", "CPF", "RG"]],
      body: driverData.map((driver) => [
        driver.name,
        driver.cnh,
        driver.phone1,
        driver.phone2,
        driver.address,
        driver.cpf,
        driver.rg,
      ]),
      theme: "grid",
      startY: 20,
      styles: {
        fontSize: 8,
        cellPadding: 1,
        textColor: 0,
        fillColor: null,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: ["#091f33"],
        textColor: [255, 255, 255],
      },
    });

    doc.save("motoristas.pdf");
  };

  const filteredDriverData = driverData.filter((driver) => {
    return (
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.cnh.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone2.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.cpf.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.rg.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div
        className={`${styles.container} ${
          isSidebarOpen ? styles["with-sidebar-open"] : styles["with-sidebar-closed"]
        }`}
      >
        <div className={styles.searchContainer}>
          <span className={styles.searchLabel}>Buscar</span>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <div className={styles.buttonContainer}>
            <button onClick={openAddressForm} className={styles.openButton}>
              Adicionar Motorista
            </button>
          </div>
          <div className={styles.buttonContainer}>
            <button onClick={exportToExcel} className={styles.exportButton}>
              Exportar para Excel
            </button>
            <button onClick={exportToPDF} className={styles.exportButton}>
              Exportar para PDF
            </button>
          </div>
        </div>

        <Modal
          isOpen={isAddressFormOpen}
          onRequestClose={closeAddressForm}
          className={styles.content}
          overlayClassName={styles.overlay}
          ariaHideApp={false}
        >
          <div className={styles.modalContent}>
            <AddressForm />
          </div>
          <div className={styles.footer}>
            <button className={styles.button} onClick={closeAddressForm}>
              Fechar
            </button>
          </div>
        </Modal>

        {filteredDriverData.length > 0 ? (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CNH</th>
                  <th>Telefone1</th>
                  <th>Telefone2</th>
                  <th>Endereço</th>
                  <th>CPF</th>
                  <th>RG</th>
                </tr>
              </thead>
              <tbody>
                {filteredDriverData.map((driver, index) => (
                  <tr key={index}>
                    <td>{driver.name}</td>
                    <td>{driver.cnh}</td>
                    <td>{driver.phone1}</td>
                    <td>{driver.phone2}</td>
                    <td>{driver.address}</td>
                    <td>{driver.cpf}</td>
                    <td>{driver.rg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p className={styles.center}>Nenhum Motorista Encontrado</p>
        )}
      </div>
    </>
  );
}
