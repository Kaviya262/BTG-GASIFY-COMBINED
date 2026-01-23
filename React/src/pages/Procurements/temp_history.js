
const [historyRemarksVisible, setHistoryRemarksVisible] = useState(false);
const [selectedHistoryRemark, setSelectedHistoryRemark] = useState("");

const handleShowHistoryRemarks = (rowData) => {
    setSelectedHistoryRemark(rowData.comment || "No remarks");
    setHistoryRemarksVisible(true);
};
