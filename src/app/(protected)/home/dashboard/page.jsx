"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Modal from "react-modal";
import AddressForm from "@/components/dashboard/page";
import base64String from "@/core/clients/base64/base64File";
import styles from "./styles.module.css";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  const openAddressForm = () => {
    setIsAddressFormOpen(true);
  };

  const closeAddressForm = () => {
    const storedRoutes = JSON.parse(localStorage.getItem("selectedRoutes")) || {
      routes: [],
    };
    setSavedRoutes(storedRoutes.routes);
    setIsAddressFormOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    const storedRoutes = JSON.parse(localStorage.getItem("selectedRoutes")) || {
      routes: [],
    };
    setSavedRoutes(storedRoutes.routes);
  }, []);

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date)) return "N/A";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const exportToExcel = () => {
    const dataToExport = savedRoutes.map((route) => ({
      Motorista: route.driver,
      "Raio(KM)": route.radius,
      "Início(Data e Hora)": formatDateTime(route.startTime),
      "Expectativa De Inicio": formatDateTime(route.startTimeExpected),
      "Fim(Data e Hora)": formatDateTime(route.endTime),
      "Expectativa De Chegada": formatDateTime(route.endTimeExpected),
      Status: route.status,
      Veículo: route.vehicle,
      "Cidade De Início": route.startCity || "N/A",
      "Cidade Final": route.endCity || "N/A",
      "Destinos Adicionais": route.additionalDestinations
        ? route.additionalDestinations.join(", ")
        : "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Routes");
    XLSX.writeFile(wb, "routes.xlsx");
  };
  const exportToPDF = () => {
    const doc = new jsPDF("portrait");
    doc.setFillColor("white");
    doc.rect(
      0,
      0,
      doc.internal.pageSize.width,
      doc.internal.pageSize.height,
      "F"
    );

    const logoBase64 = base64String;

    doc.setGState(new doc.GState({ opacity: 0.2 }));
    doc.addImage(logoBase64, "PNG", 30, 20, 150, 120);

    doc.setGState(new doc.GState({ opacity: 1 }));
    autoTable(doc, {
      margin: { top: 10, right: 5, bottom: 10, left: 5 },
      head: [
        [
          "Motorista",
          "Raio(KM)",
          "Início(Data e Hora)",
          "Expectativa De Inicio",
          "Fim(Data e Hora)",
          "Expectativa De Chegada",
          "Status",
          "Veículo",
          "Cidade De Início",
          "Cidade Final",
          "Destinos Adicionais",
        ],
      ],
      body: filteredRoutes.map((route) => [
        route.driver,
        route.radius,
        formatDateTime(route.startTime),
        formatDateTime(route.startTimeExpected),
        formatDateTime(route.endTime),
        formatDateTime(route.endTimeExpected),
        route.status,
        route.vehicle,
        route.startCity || "N/A",
        route.endCity || "N/A",
        route.additionalDestinations
          ? route.additionalDestinations.join(", ")
          : "N/A",
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
      columnStyles: {
        0: { cellWidth: 16 },
        1: { cellWidth: 16 },
        2: { cellWidth: 16 },
        3: { cellWidth: 16 },
        4: { cellWidth: 16 },
        5: { cellWidth: 16 },
        6: { cellWidth: "auto" },
        7: { cellWidth: "auto" },
        8: { cellWidth: "auto" },
        9: { cellWidth: "auto" },
        10: { cellWidth: 20 },
      },
    });

    doc.save("rotas_com_logo.pdf");
  };

  const handleRowClick = (route) => {
    const hasMultipleRoutes = route.routes && route.routes.length > 1;
    if (hasMultipleRoutes) {
      localStorage.setItem(
        "gps",
        JSON.stringify({
          routes: route.routes,
          radius: route.radius,
          driver: route.driver,
        })
      );
    } else {
      localStorage.setItem(
        "gps",
        JSON.stringify({
          coordinates: route.routes[0].coordinates,
          radius: route.radius,
          driver: route.driver,
        })
      );
    }
    router.push("/home/gps");
  };

  const filteredRoutes = savedRoutes.filter((route) => {
    return (
      route.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.radius.toString().includes(searchTerm) ||
      formatDateTime(route.startTime).includes(searchTerm) ||
      formatDateTime(route.endTime).includes(searchTerm) ||
      route.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRoutes.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);

  const drivers = [...new Set(filteredRoutes.map((route) => route.driver))];
  const statuses = [...new Set(filteredRoutes.map((route) => route.status))];

  const tripsPerDriver = drivers.map(
    (driver) => filteredRoutes.filter((route) => route.driver === driver).length
  );

  const tripsPerDay = filteredRoutes.reduce((acc, route) => {
    const date = formatDateTime(route.startTime).split(" ")[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const tripsPerStatus = statuses.map(
    (status) => filteredRoutes.filter((route) => route.status === status).length
  );

  const lineChartData = {
    labels: Object.keys(tripsPerDay),
    datasets: [
      {
        label: "Viagens por Dia",
        data: Object.values(tripsPerDay),
        fill: false,
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
      },
    ],
  };

  const barChartData = {
    labels: drivers,
    datasets: [
      {
        label: "Viagens por Motorista",
        data: tripsPerDriver,
        backgroundColor: "rgba(153,102,255,0.6)",
        borderColor: "rgba(153,102,255,1)",
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: statuses,
    datasets: [
      {
        label: "Distribuição de Status",
        data: tripsPerStatus,
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };

  return (
    <>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div
        className={`${styles.container} ${
          isSidebarOpen
            ? styles["with-sidebar-open"]
            : styles["with-sidebar-closed"]
        }`}
      >
        <div className={styles.cardsContainer}>
          <div className={styles.card}>
            <span>Viagens Do Dia</span>
            <strong>13</strong>
          </div>
          <div className={styles.card}>
            <span>Viagens Do Mes</span>
            <strong>25</strong>
          </div>
          <div className={`${styles.card} ${styles.totalCard}`}>
            <span>Total De Viagens</span>
            <strong>38</strong>
          </div>
        </div>
        <div className={styles.chartsContainer}>
          <div className={styles.chart}>
            <Line data={lineChartData} />
          </div>
          <div className={styles.chart}>
            <Bar data={barChartData} />
          </div>
          <div className={styles.chartPie}>
            <Pie data={pieChartData} />
          </div>
        </div>
        <div className={styles.searchContainer}>
          <span className={styles.searchLabel}>Buscar</span>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {/* <div className={styles.buttonContainer}>
            <button onClick={openAddressForm} className={styles.openButton}>
              Criar rota
            </button>
          </div> */}
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
        {filteredRoutes.length > 0 ? (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Motorista</th>
                  <th>Raio(KM)</th>
                  <th>Início(Data e Hora)</th>
                  <th>Expectativa De Inicio</th>
                  <th>Fim(Data e Hora)</th>
                  <th>Expectativa De Chegada</th>
                  <th>Status</th>
                  <th>Veículo</th>
                  <th>Cidade De Início</th>
                  <th>Cidade Final</th>
                  <th>Destinos Adicionais</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((route, index) => {
                  const finalCity =
                    route.endCity ||
                    (route.additionalDestinations &&
                      route.additionalDestinations[0]) ||
                    "N/A";
                  const additionalDestinations = route.endCity
                    ? route.additionalDestinations || []
                    : (route.additionalDestinations || []).slice(1);

                  return (
                    <tr
                      key={index}
                      onClick={() => handleRowClick(route)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{route.driver}</td>
                      <td>{route.radius}</td>
                      <td>{formatDateTime(route.startTime)}</td>
                      <td>{formatDateTime(route.startTimeExpected)}</td>
                      <td>{formatDateTime(route.endTime)}</td>
                      <td>{formatDateTime(route.endTimeExpected)}</td>
                      <td>{route.status}</td>
                      <td>{route.vehicle}</td>
                      <td>{route.startCity || "N/A"}</td>
                      <td>{finalCity}</td>
                      <td>
                        {additionalDestinations.length > 0 ? (
                          <ul>
                            {additionalDestinations.map((dest, idx) => (
                              <li key={idx}>{dest}</li>
                            ))}
                          </ul>
                        ) : (
                          "N/A"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className={styles.pagination}>
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={styles.paginationButton}
            >
              <FaArrowLeft />
            </button>
            <span className={styles.pageIndicator}>
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={styles.paginationButton}
            >
              <FaArrowRight />
            </button>
          </div>
          </>
        ) : (
          <p className={styles.center}>Nenhum Dado Encontrado</p>
        )}
      </div>
    </>
  );
}
