export interface Stop {
  name: string;
  nameEN?: string;
  time: string;
}

export interface Run {
  id: string;
  direction: 'Andata' | 'Ritorno';
  directionLabelIT: string;
  directionLabelEN: string;
  departureTime: string;
  stops: Stop[];
  periodCode?: string;
}

export interface BusLine {
  line: string;
  routeIT: string;
  routeEN: string;
  platformIT: string;
  platformEN: string;
  runs: Run[];
  category: 'Salerno' | 'Avellino' | 'Benevento' | 'Cava-Nocera-Paesi Vesuviani' | 'Napoli' | 'Fuori Regione' | 'Sud-Battipaglia' | 'Campus';
}

export const PERIOD_LEGEND: Record<string, { IT: string; EN: string }> = {
  A6_FE6: {
    IT: 'Annuale Lun-Sab',
    EN: 'Annual Mon-Sat',
  },
  A6_FE5: {
    IT: 'Annuale Lun-Ven',
    EN: 'Annual Mon-Fri',
  },
  A9_FE5: {
    IT: 'Annuale Lun-Ven (tranne Lug, Ago, Natale)',
    EN: 'Annual Mon-Fri (except Jul, Aug, Christmas)',
  },
  SA_FE5: {
    IT: 'Scolastico Lun-Ven',
    EN: 'School days Mon-Fri',
  },
  UR_FE5: {
    IT: 'Annuale Lun-Ven (tranne Ago, Natale)',
    EN: 'Annual Mon-Fri (except Aug, Christmas)',
  },
  URPSFE5: {
    IT: 'Annuale Straordinario Università (tranne Ago, Natale)',
    EN: 'Annual University Special (except Aug, Christmas)',
  },
  A8_FE5: {
    IT: 'Annuale Lun-Ven (eccetto Agosto)',
    EN: 'Annual Mon-Fri (except August)',
  },
  SA_SAB: {
    IT: 'Scolastico Sabato',
    EN: 'School days Saturday',
  },
  SA_FE6: {
    IT: 'Scolastico Lun-Sab',
    EN: 'School days Mon-Sat',
  },
  SC_FE6: {
    IT: 'Non scolastico (Sep-Giu)',
    EN: 'Non-school days (Sep-Jun)',
  },
  SC_FE5: {
    IT: 'Non scolastico Lun-Ven',
    EN: 'Non-school days Mon-Fri',
  },
  SAPSFE5: {
    IT: 'Scuole Aperte Straordinario Lun-Ven',
    EN: 'Open Schools Extra Mon-Fri',
  },
  SA_MG: {
    IT: 'Scolastico Mar e Gio',
    EN: 'School days Tue & Thu',
  },
  UAPSFE5: {
    IT: 'Aggiuntiva Universitaria Lun-Ven',
    EN: 'Additional University Mon-Fri',
  },
};

const buildLine09Runs = (): Run[] => {
  const outboundRaw = [
    { p: 'SA_FE6', t: ["06:30", "06:38", "06:50", "06:51", "06:52", "07:00", "07:05", "07:12", "07:18", "07:20", "", "", "07:36", "07:39", "", "07:40", "07:43", "07:48", "", "", "08:00", "", "", "", "", "", ""] },
    { p: 'SA_SAB', t: ["06:30", "06:38", "06:50", "06:51", "06:52", "07:00", "07:05", "07:12", "07:18", "07:20", "", "", "07:36", "07:39", "", "07:40", "07:43", "07:48", "", "", "08:00", "", "", "", "", "", ""] },
    { p: 'SC_FE6', t: ["06:35", "06:45", "06:58", "06:59", "07:00", "07:08", "07:14", "07:25", "07:26", "07:35", "", "", "", "07:45", "", "07:46", "07:48", "07:50", "07:55", "07:56", "08:00", "", "", "", "", "", ""] },
    { p: 'SA_FE5', t: ["", "", "", "", "", "", "", "06:50", "", "07:05", "", "", "", "07:17", "", "07:18", "", "", "", "", "", "07:28", "07:40", "", "", "", ""] },
    { p: 'A8_FE5', t: ["", "", "", "", "", "", "", "", "", "07:00", "", "", "", "07:15", "", "07:18", "", "", "", "", "", "07:25", "", "", "", "08:30", ""] },
    { p: 'A8_FE5', t: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "07:30", "08:20", ""] },
    { p: 'SA_FE5', t: ["", "", "", "", "", "", "", "", "", "", "", "", "08:15", "08:19", "", "08:21", "08:25", "08:28", "08:35", "", "08:40", "", "", "", "", "", ""] },
    { p: 'SA_FE5', t: ["", "", "", "", "", "", "", "", "", "11:40", "", "", "", "", "12:00", "", "", "", "", "", "", "", "", "", "", "", ""] },
    { p: 'SA_FE5', t: ["", "", "", "", "", "", "", "", "", "", "", "", "12:00", "12:02", "", "12:03", "12:06", "12:08", "12:12", "", "12:15", "", "", "", "", "", ""] },
    { p: 'SA_SAB', t: ["", "", "", "", "", "", "", "", "", "", "", "", "", "13:40", "", "13:43", "", "13:45", "", "", "13:56", "", "", "", "", "", ""] },
    { p: 'SA_FE5', t: ["", "", "", "", "", "", "", "", "", "14:05", "", "", "", "", "14:20", "", "", "", "", "", "", "", "", "", "", "", ""] },
    { p: 'SA_SAB', t: ["", "", "", "", "", "", "", "", "", "14:05", "", "", "", "14:20", "", "", "", "", "", "", "", "", "", "", "", "", ""] },
    { p: 'SA_SAB', t: ["", "", "", "", "", "", "", "", "", "", "", "", "", "14:20", "", "14:21", "", "", "", "", "", "", "", "", "14:45", "", ""] },
    { p: 'SA_FE5', t: ["", "", "", "", "", "", "", "", "", "", "", "", "14:20", "14:22", "", "14:24", "", "", "", "", "", "", "14:40", "", "", "", ""] },
    { p: 'SA_MG', t: ["", "", "", "", "", "", "", "", "", "", "15:05", "15:10", "", "15:13", "15:17", "", "", "", "", "", "", "15:29", "15:39", "", "", "", "15:50"] },
    { p: 'SC_FE5', t: ["", "", "", "", "", "", "", "", "", "", "", "", "", "15:20", "", "15:21", "15:23", "15:25", "15:30", "15:30", "15:35", "", "", "", "", "", ""] },
    { p: 'A6_FE6', t: ["", "", "", "", "", "", "", "", "", "", "", "", "", "20:25", "", "20:26", "20:28", "20:29", "20:35", "20:35", "20:40", "", "", "", "", "", ""] }
  ];

  const returnRaw = [
    { p: 'SA_FE5', t: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "07:40", "", "", "", "", "", "", "", "", "08:05", "", "", "", "", "", "", "", "", "", ""] },
    { p: 'SA_FE5', t: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "07:55", "", "", "08:04", "08:08", "08:10", "", "", "", "", "", "", "", "", ""] },
    { p: 'SA_FE5', t: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "08:20", "08:23", "08:40", "", "", "", "", "", "", "", ""] },
    { p: 'SA_SAB', t: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "08:20", "", "08:40", "", "", "", "", "", "", "", ""] },
    { p: 'SC_FE6', t: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "08:20", "", "08:40", "", "", "", "", "", "", "", ""] },
    { p: 'A6_FE6', t: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "20:05", "", "", "", "", "", "20:25", "", "", "", "", "", "", "", "", "", ""] },
    { p: 'SA_SAB', t: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "13:20", "", "", "", "", "", "", "", "", "13:40", "", "", "", "", "", "", "", "", "", ""] },
    { p: 'SA_FE5', t: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "13:20", "13:37", "13:40", "", "", "", "", "", "", ""] },
    { p: 'SC_FE6', t: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "13:20", "", "", "", "13:30", "", "", "", "", "13:40", "", "", "", "", "", "", "", "", "", ""] },
    { p: 'SA_FE5', t: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "13:40", "13:55", "13:59", "", "14:15", "14:19", "14:20", "14:25", "14:35", "14:45"] },
    { p: 'SC_FE6', t: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "13:40", "", "13:59", "14:02", "14:06", "14:16", "14:20", "14:21", "14:26", "14:33", "14:45"] },
    { p: 'SA_FE6', t: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "13:40", "", "13:57", "14:00", "", "", "", "", "", "", ""] },
    { p: 'SA_FE5', t: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "14:05", "", "", "", "", "", "", "", "", "14:24", "14:26", "14:41", "14:44", "15:00", "15:04", "15:10", "", "", "15:24", "15:34"] },
    { p: 'A8_FE5', t: ["14:10", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "14:55", "", "15:05", "", "", "", "", "", "", "", "", "15:23", "", "15:35", "", "", "", "", "", "", "", ""] },
    { p: 'SA_SAB', t: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "14:25", "", "14:44", "14:47", "14:51", "15:01", "15:05", "15:06", "15:11", "15:18", "15:30"] },
    { p: 'SA_FE6', t: ["", "14:30", "14:31", "14:32", "14:34", "14:35", "14:40", "14:41", "14:42", "14:43", "14:45", "14:45", "14:47", "15:02", "15:04", "15:06", "", "", "", "15:19", "15:19", "15:20", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""] },
    { p: 'SA_MG', t: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "15:25", "15:40", "15:44", "15:50", "16:00", "16:04", "16:05", "16:10", "16:20", "16:30"] },
    { p: 'A8_FE5', t: ["18:00", "", "", "", "", "", "", "", "", "", "", "", "", "18:34", "18:35", "18:36", "", "", "", "", "", "18:51", "", "", "", "", "", "19:19", "", "19:30", "", "", "", "", "", "", "", ""] },
    { p: 'A6_FE6', t: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "20:05", "", "", "", "", "", "20:25", "", "", "", "", "", "", "", "", "", ""] }
  ];

  const outboundStopsData = [
    { name: "Senerchia, Capolinea", nameEN: "Senerchia, Terminus" },
    { name: "Quaglietta, Piazza S.Nicola 66", nameEN: "Quaglietta, Piazza S.Nicola 66" },
    { name: "Calabritto, V.della Resistenza 11", nameEN: "Calabritto, V.della Resistenza 11" },
    { name: "Calabritto, P.zza Matteotti", nameEN: "Calabritto, P.zza Matteotti" },
    { name: "Calabritto, V.della Resistenza 48", nameEN: "Calabritto, V.della Resistenza 48" },
    { name: "Calabritto, Bivio", nameEN: "Calabritto, Junction" },
    { name: "Calabritto, C.da Ponte Oliveto", nameEN: "Calabritto, C.da Ponte Oliveto" },
    { name: "Caposele, Cimitero", nameEN: "Caposele, Cemetery" },
    { name: "Caposele, Via 4 Novembre 32", nameEN: "Caposele, Via 4 Novembre 32" },
    { name: "Materdomini, Capolinea", nameEN: "Materdomini, Terminus" },
    { name: "Sant'Angelo dei Lombardi, Capolinea", nameEN: "Sant'Angelo dei Lombardi, Terminus" },
    { name: "Lioni, Bar 2001", nameEN: "Lioni, Bar 2001" },
    { name: "Lioni, Via Torino", nameEN: "Lioni, Via Torino" },
    { name: "Lioni, Via Ortolono", nameEN: "Lioni, Via Ortolono" },
    { name: "Lioni, Via Torino", nameEN: "Lioni, Via Torino" },
    { name: "Lioni, Bar 2001", nameEN: "Lioni, Bar 2001" },
    { name: "Lioni, Farmacia Comunale", nameEN: "Lioni, Municipal Pharmacy" },
    { name: "Sant'Angelo dei Lombardi, Fraz. San Guglielmo", nameEN: "Sant'Angelo dei Lombardi, San Guglielmo" },
    { name: "Sant'Angelo dei Lombardi, Ospedale", nameEN: "Sant'Angelo dei Lombardi, Hospital" },
    { name: "Sant'Angelo dei Lombardi, Quadrivio", nameEN: "Sant'Angelo dei Lombardi, Quadrivio" },
    { name: "Sant'Angelo dei Lombardi, Capolinea", nameEN: "Sant'Angelo dei Lombardi, Terminus" },
    { name: "Nusco scalo", nameEN: "Nusco Scalo" },
    { name: "Montella, Via S.Nicola Clemente", nameEN: "Montella, Via S.Nicola Clemente" },
    { name: "Avellino, svincolo Pianodardine", nameEN: "Avellino, Pianodardine Junction" },
    { name: "Cassano Irpino, C.da Torre dei Rocci", nameEN: "Cassano Irpino, C.da Torre dei Rocci" },
    { name: "Fisciano, Terminal Bus", nameEN: "Fisciano Campus (Bus Terminal)" },
    { name: "Bagnoli irpino, P.zza Matteotti", nameEN: "Bagnoli irpino, P.zza Matteotti" }
  ];

  const returnStopsData = [
    { name: "Fisciano, Terminal Bus", nameEN: "Fisciano Campus (Bus Terminal)" },
    { name: "Avellino, Autostazione Air", nameEN: "Avellino Air Bus Station" },
    { name: "Avellino, Via Cappuccio", nameEN: "Avellino, Via Cappuccio" },
    { name: "Avellino, Via Morelli e Silvati 7", nameEN: "Avellino, Via Morelli e Silvati 7" },
    { name: "Avellino, Via Annarumma 51", nameEN: "Avellino, Via Annarumma 51" },
    { name: "Avellino, Città Ospedaliera", nameEN: "Avellino Hospital" },
    { name: "Avellino, Via Francesco Tedesco 441", nameEN: "Avellino, Via Francesco Tedesco 441" },
    { name: "Avellino, Via Francesco Tedesco, Stazione FF.SS", nameEN: "Avellino Station FF.SS" },
    { name: "Atripalda, Via Ferrovia - Parco delle Acacie", nameEN: "Atripalda, Parco delle Acacie" },
    { name: "Atripalda, Via Roma 183", nameEN: "Atripalda, Via Roma 183" },
    { name: "Atripalda, Piazza Umberto I", nameEN: "Atripalda, Piazza Umberto I" },
    { name: "Atripalda, Via Circumvallazione", nameEN: "Atripalda, Via Circumvallazione" },
    { name: "Manocalzati, Svincolo Ofantina Bis", nameEN: "Manocalzati Junction" },
    { name: "Volturara Irpina, Svincolo", nameEN: "Volturara Junction" },
    { name: "Volturara Irpina, Capolinea", nameEN: "Volturara Terminus" },
    { name: "Volturara Irpina, Svincolo", nameEN: "Volturara Junction" },
    { name: "Montemarano, Svincolo", nameEN: "Montemarano Junction" },
    { name: "Montella, Convento San Francesco", nameEN: "Montella, San Francesco Convent" },
    { name: "Montella, Via S.Nicola Clemente 40", nameEN: "Montella, Via S.Nicola Clemente 40" },
    { name: "Cassano Irpino, Bivio", nameEN: "Cassano Irpino Junction" },
    { name: "Cassano Irpino, Centro Sociale", nameEN: "Cassano Irpino, Social Center" },
    { name: "Cassano Irpino, C.da Torre dei Rocci", nameEN: "Cassano Irpino, C.da Torre dei Rocci" },
    { name: "Nusco Scalo", nameEN: "Nusco Scalo" },
    { name: "Sant'Angelo dei Lombardi, Via Bartolomei", nameEN: "Sant'Angelo dei Lombardi, Via Bartolomei" },
    { name: "Sant'Angelo dei Lombardi, Quadrivio", nameEN: "Sant'Angelo dei Lombardi, Quadrivio" },
    { name: "Sant'Angelo dei Lombardi, Ospedale", nameEN: "Sant'Angelo dei Lombardi Hospital" },
    { name: "Lioni, Farmacia Comunale", nameEN: "Lioni Municipal Pharmacy" },
    { name: "Lioni, Via Ortolono", nameEN: "Lioni, Via Ortolono" },
    { name: "Lioni, Via Torino", nameEN: "Lioni, Via Torino" },
    { name: "Materdomini, Capolinea", nameEN: "Materdomini Terminus" },
    { name: "Caposele, Via 4 Novembre 32", nameEN: "Caposele, Via 4 Novembre 32" },
    { name: "Caposele, Cimitero", nameEN: "Caposele Cemetery" },
    { name: "Calabritto, Bivio", nameEN: "Calabritto Junction" },
    { name: "Calabritto, V.le della Resistenza 11", nameEN: "Calabritto, V.le della Resistenza 11" },
    { name: "Calabritto, P.zza Giacomo Matteotti", nameEN: "Calabritto, P.zza Giacomo Matteotti" },
    { name: "Calabritto, Bivio", nameEN: "Calabritto Junction" },
    { name: "Quaglietta, P.zza San Nicola 66", nameEN: "Quaglietta, P.zza San Nicola 66" },
    { name: "Senerchia, Capolinea", nameEN: "Senerchia Terminus" }
  ];

  const runs: Run[] = [];

  // Outbound
  outboundRaw.forEach((raw, index) => {
    const stopsList: Stop[] = [];
    raw.t.forEach((time, stopIdx) => {
      if (time !== "") {
        stopsList.push({
          name: outboundStopsData[stopIdx].name,
          nameEN: outboundStopsData[stopIdx].nameEN,
          time
        });
      }
    });
    if (stopsList.length > 0) {
      runs.push({
        id: `9-a${index + 1}`,
        direction: 'Andata',
        directionLabelIT: 'Senerchia ➔ Fisciano',
        directionLabelEN: 'Senerchia ➔ Fisciano',
        departureTime: stopsList[0].time,
        stops: stopsList,
        periodCode: raw.p
      });
    }
  });

  // Return
  returnRaw.forEach((raw, index) => {
    const stopsList: Stop[] = [];
    raw.t.forEach((time, stopIdx) => {
      if (time !== "") {
        stopsList.push({
          name: returnStopsData[stopIdx].name,
          nameEN: returnStopsData[stopIdx].nameEN,
          time
        });
      }
    });
    if (stopsList.length > 0) {
      runs.push({
        id: `9-r${index + 1}`,
        direction: 'Ritorno',
        directionLabelIT: 'Fisciano ➔ Senerchia',
        directionLabelEN: 'Fisciano ➔ Senerchia',
        departureTime: stopsList[0].time,
        stops: stopsList,
        periodCode: raw.p
      });
    }
  });

  return runs;
};

const buildLine14Runs = (): Run[] => {
  const outboundRaw = [
    { p: 'A9_FE5', t: ["07:25", "07:27", "07:29", "07:33", "07:36", "07:37", "07:48", "07:55", "", "", "", "", "08:05", ""] },
    { p: 'A6_FE6', t: ["07:25", "07:27", "07:29", "07:33", "07:36", "07:37", "07:48", "07:55", "", "", "", "", "08:05", "08:15"] },
    { p: 'SA_FE5', t: ["07:45", "07:47", "07:49", "07:53", "07:56", "07:57", "08:08", "08:15", "", "", "", "", "08:25", ""] },
    { p: 'UR_FE5', t: ["07:50", "07:52", "07:54", "07:58", "08:01", "08:02", "08:13", "08:20", "", "", "", "", "08:30", ""] },
    { p: 'URPSFE5', t: ["07:50", "07:52", "07:54", "07:58", "08:01", "08:02", "08:13", "08:20", "", "", "", "", "08:30", ""] },
    { p: 'A6_FE6', t: ["08:00", "08:02", "08:04", "08:08", "08:11", "08:12", "08:23", "08:30", "", "", "", "", "08:40", ""] },
    { p: 'A9_FE5', t: ["08:20", "08:22", "08:24", "08:28", "08:31", "08:32", "08:43", "08:50", "", "", "", "", "09:00", ""] },
    { p: 'A9_FE5', t: ["08:40", "08:42", "08:44", "08:48", "08:51", "08:52", "09:03", "09:10", "", "", "09:15", "09:20", "09:25", "09:30"] },
    { p: 'UR_FE5', t: ["09:00", "09:02", "09:04", "09:08", "09:11", "09:12", "09:23", "09:30", "", "", "", "", "09:40", ""] },
    { p: 'A9_FE5', t: ["09:30", "09:32", "09:34", "09:38", "09:41", "09:42", "09:53", "10:00", "", "", "", "", "10:15", "10:20"] },
    { p: 'UR_FE5', t: ["10:00", "10:02", "10:04", "10:08", "10:11", "10:12", "10:23", "10:30", "", "", "", "", "10:40", ""] },
    { p: 'A9_FE5', t: ["10:30", "10:32", "10:34", "10:38", "10:41", "10:42", "10:53", "11:00", "", "", "", "", "11:10", ""] },
    { p: 'UR_FE5', t: ["11:00", "11:02", "11:04", "11:08", "11:11", "11:12", "11:23", "11:30", "", "", "", "", "11:45", "11:50"] },
    { p: 'A9_FE5', t: ["11:30", "11:32", "11:34", "11:38", "11:41", "11:42", "11:53", "12:00", "", "", "12:05", "12:10", "12:15", ""] },
    { p: 'UR_FE5', t: ["12:00", "12:02", "12:04", "12:08", "12:11", "12:12", "12:23", "12:30", "", "", "", "", "12:40", ""] },
    { p: 'A6_FE5', t: ["13:00", "13:02", "13:04", "13:08", "13:11", "13:12", "13:23", "13:30", "13:35", "13:40", "", "", "13:50", "14:00"] },
    { p: 'UR_FE5', t: ["13:50", "13:52", "13:54", "13:58", "14:01", "14:02", "14:13", "14:20", "14:25", "14:30", "", "", "14:40", ""] },
    { p: 'A6_FE5', t: ["15:00", "15:02", "15:04", "15:08", "15:11", "15:12", "15:23", "15:30", "", "", "", "", "15:40", ""] },
    { p: 'UR_FE5', t: ["16:00", "16:02", "16:04", "16:08", "16:11", "16:12", "16:23", "16:30", "", "", "", "", "16:40", ""] },
    { p: 'UR_FE5', t: ["16:30", "16:32", "16:34", "16:38", "16:41", "16:42", "16:53", "17:00", "", "", "", "", "17:10", ""] },
    { p: 'A9_FE5', t: ["18:00", "18:02", "18:04", "18:08", "18:11", "18:12", "18:23", "18:30", "", "", "", "", "18:40", ""] }
  ];

  const returnRaw = [
    { p: 'UR_FE5', t: ["", "08:15", "", "", "08:25", "", "08:30", "08:40", "08:41", "08:50", "08:54", "08:55"] },
    { p: 'UR_FE5', t: ["", "08:45", "", "", "08:55", "09:00", "09:05", "09:15", "09:21", "09:30", "09:34", "09:35"] },
    { p: 'A6_FE6', t: ["", "09:15", "", "", "09:25", "", "09:30", "09:40", "09:41", "09:50", "09:54", "09:55"] },
    { p: 'UR_FE5', t: ["09:35", "09:45", "", "", "09:58", "", "10:02", "10:10", "10:11", "10:20", "10:24", "10:25"] },
    { p: 'UR_FE5', t: ["", "10:15", "", "", "10:25", "", "10:30", "10:40", "10:41", "10:50", "10:54", "10:55"] },
    { p: 'A9_FE5', t: ["", "10:45", "", "", "10:55", "", "11:00", "11:10", "11:11", "11:20", "11:24", "11:25"] },
    { p: 'UR_FE5', t: ["", "11:15", "", "", "11:25", "", "11:30", "11:40", "11:41", "11:50", "11:54", "11:55"] },
    { p: 'A9_FE5', t: ["", "11:45", "", "", "11:55", "", "12:00", "12:10", "12:11", "12:20", "12:24", "12:25"] },
    { p: 'UR_FE5', t: ["", "12:15", "", "", "12:25", "", "12:30", "12:40", "12:41", "12:50", "12:54", "12:55"] },
    { p: 'A9_FE5', t: ["12:35", "12:45", "", "", "12:58", "", "13:02", "13:10", "13:11", "13:20", "13:24", "13:25"] },
    { p: 'URPSFE5', t: ["", "12:45", "", "", "12:55", "", "13:00", "13:10", "13:11", "13:20", "13:24", "13:25"] },
    { p: 'UR_FE5', t: ["13:00", "13:15", "", "", "13:25", "", "13:30", "13:40", "13:41", "13:50", "13:54", "13:55"] },
    { p: 'A9_FE5', t: ["", "13:45", "13:50", "13:55", "14:00", "", "14:05", "14:15", "14:16", "14:25", "14:29", "14:30"] },
    { p: 'UR_FE5', t: ["14:05", "14:15", "", "", "14:25", "", "14:30", "14:40", "14:41", "14:50", "14:54", "14:55"] },
    { p: 'A6_FE5', t: ["", "14:45", "", "", "14:55", "", "15:00", "15:10", "15:11", "15:20", "15:24", "15:25"] },
    { p: 'UR_FE5', t: ["", "15:15", "", "", "15:25", "", "15:30", "15:40", "15:41", "15:50", "15:54", "15:55"] },
    { p: 'A6_FE5', t: ["", "15:45", "", "", "15:55", "", "16:00", "16:10", "16:11", "16:20", "16:24", "16:25"] },
    { p: 'UR_FE5', t: ["", "16:15", "", "", "16:25", "", "16:30", "16:40", "16:41", "16:50", "16:54", "16:55"] },
    { p: 'A9_FE5', t: ["", "16:45", "", "", "16:55", "", "17:00", "17:10", "17:11", "17:20", "17:24", "17:25"] },
    { p: 'A9_FE5', t: ["", "17:15", "", "", "17:25", "", "17:30", "17:40", "17:41", "17:50", "17:54", "17:55"] },
    { p: 'A6_FE5', t: ["17:35", "17:45", "", "", "17:55", "", "18:00", "18:10", "18:11", "18:20", "18:24", "18:25"] },
    { p: 'A9_FE5', t: ["18:05", "18:15", "", "", "18:25", "", "18:30", "18:40", "18:41", "18:50", "18:54", "18:55"] },
    { p: 'URPSFE5', t: ["", "18:45", "18:50", "18:55", "19:00", "", "19:05", "19:15", "19:16", "19:25", "19:29", "19:30"] },
    { p: 'A9_FE5', t: ["", "19:15", "", "", "19:25", "", "19:30", "19:40", "19:41", "19:50", "19:54", "19:55"] },
    { p: 'UR_FE5', t: ["19:40", "19:50", "", "", "20:03", "", "20:07", "20:15", "20:16", "20:25", "20:29", "20:30"] }
  ];

  const outboundStopsData = [
    { name: "Avellino Autostazione Air", nameEN: "Avellino Air Bus Station" },
    { name: "Avellino, Via Guglielmo Marconi 7", nameEN: "Avellino, Via Guglielmo Marconi 7" },
    { name: "Via Acciani, Dir.Atripalda, Avellino, AV", nameEN: "Via Acciani, Dir.Atripalda, Avellino, AV" },
    { name: "Avellino, C.da Sant'Oronzo", nameEN: "Avellino, C.da Sant'Oronzo" },
    { name: "Atripalda, Contrada Tufarole 35", nameEN: "Atripalda, Contrada Tufarole 35" },
    { name: "Atripalda, Via Appia Svincolo", nameEN: "Atripalda, Via Appia Svincolo" },
    { name: "Serino, Svincolo", nameEN: "Serino, Svincolo" },
    { name: "Solofra, Svincolo (IN)", nameEN: "Solofra, Svincolo (IN)" },
    { name: "Solofra, Terminal Bus", nameEN: "Solofra, Terminal Bus" },
    { name: "Solofra, Svincolo (OUT)", nameEN: "Solofra, Svincolo (OUT)" },
    { name: "Montoro Superiore, Via 4 Novembre", nameEN: "Montoro Superiore, Via 4 Novembre" },
    { name: "Montoro Inferiore, df Ristorante \"La Foresta\"", nameEN: "Montoro Inferiore, opp. \"La Foresta\" Restaurant" },
    { name: "Fisciano, Terminal Bus", nameEN: "Fisciano Campus (Bus Terminal)" },
    { name: "Lancusi Università", nameEN: "Lancusi University" }
  ];

  const returnStopsData = [
    { name: "Lancusi Università", nameEN: "Lancusi University" },
    { name: "Fisciano, Terminal Bus", nameEN: "Fisciano Campus (Bus Terminal)" },
    { name: "Montoro Inferiore, df Ristorante \"La Foresta\"", nameEN: "Montoro Inferiore, opp. \"La Foresta\" Restaurant" },
    { name: "Montoro Superiore, Via 4 Novembre", nameEN: "Montoro Superiore, Via 4 Novembre" },
    { name: "Solofra Svincolo", nameEN: "Solofra Svincolo" },
    { name: "Solofra, Terminal Bus", nameEN: "Solofra, Terminal Bus" },
    { name: "Serino, Rampa Raccordo", nameEN: "Serino, Rampa Raccordo" },
    { name: "Atripalda, Via Appia Svincolo", nameEN: "Atripalda, Via Appia Svincolo" },
    { name: "Atripalda, Contrada Tufarole 36", nameEN: "Atripalda, Contrada Tufarole 36" },
    { name: "Via Giulio Acciani, 24, Avellino, AV", nameEN: "Via Giulio Acciani, 24, Avellino, AV" },
    { name: "Avellino, Via Guglielmo Marconi 7", nameEN: "Avellino, Via Guglielmo Marconi 7" },
    { name: "Avellino Autostazione Air", nameEN: "Avellino Air Bus Station" }
  ];

  const runs: Run[] = [];

  // Outbound
  outboundRaw.forEach((raw, index) => {
    const stopsList: Stop[] = [];
    raw.t.forEach((time, stopIdx) => {
      if (time !== "") {
        stopsList.push({
          name: outboundStopsData[stopIdx].name,
          nameEN: outboundStopsData[stopIdx].nameEN,
          time
        });
      }
    });
    if (stopsList.length > 0) {
      runs.push({
        id: `14-a${index + 1}`,
        direction: 'Andata',
        directionLabelIT: 'Avellino ➔ Fisciano',
        directionLabelEN: 'Avellino ➔ Fisciano',
        departureTime: stopsList[0].time,
        stops: stopsList,
        periodCode: raw.p
      });
    }
  });

  // Return
  returnRaw.forEach((raw, index) => {
    const stopsList: Stop[] = [];
    raw.t.forEach((time, stopIdx) => {
      if (time !== "") {
        stopsList.push({
          name: returnStopsData[stopIdx].name,
          nameEN: returnStopsData[stopIdx].nameEN,
          time
        });
      }
    });
    if (stopsList.length > 0) {
      runs.push({
        id: `14-r${index + 1}`,
        direction: 'Ritorno',
        directionLabelIT: 'Fisciano ➔ Avellino',
        directionLabelEN: 'Fisciano ➔ Avellino',
        departureTime: stopsList[0].time,
        stops: stopsList,
        periodCode: raw.p
      });
    }
  });

  return runs;
};

const buildLine23Runs = (): Run[] => {
  const outboundRaw = [
    { p: 'UAPSFE5', t: ["06:45", "06:57", "07:01", "07:11", "07:14", "", "07:16", "07:22", "07:26", "07:29", "07:31", "07:35", "07:37", "07:38", "07:55", "08:00", "08:15"] },
    { p: 'UAPSFE5', t: ["", "", "", "", "", "07:15", "07:18", "07:26", "07:29", "07:32", "07:35", "07:38", "07:40", "07:41", "08:00", "08:05", "08:15"] },
    { p: 'A8_FE5', t: ["", "", "", "", "", "08:35", "08:38", "08:46", "08:49", "08:52", "08:55", "08:58", "09:00", "09:01", "09:20", "09:25", "09:35"] }
  ];

  const returnRaw = [
    { p: 'A8_FE5', t: ["13:40", "13:50", "13:55", "14:14", "14:17", "14:21", "14:24", "14:28", "14:36", "14:40", "", "", "", "", "", "", ""] },
    { p: 'A8_FE5', t: ["17:15", "17:25", "17:30", "17:49", "17:52", "17:56", "17:59", "18:03", "18:11", "18:15", "", "", "", "", "", "", ""] },
    { p: 'A8_FE5', t: ["18:40", "18:59", "19:05", "19:26", "19:30", "19:34", "19:38", "19:43", "19:55", "", "20:00", "20:02", "20:03", "20:04", "20:12", "20:16", "20:20"] }
  ];

  const outboundStopsData = [
    { name: "Nola, Via Variante 7 bis, bar Cardarelli", nameEN: "Nola, Via Variante 7 bis, Bar Cardarelli" },
    { name: "Roccarainola, Via Matteotti", nameEN: "Roccarainola, Via Matteotti" },
    { name: "Tufino, Via G.Verdi", nameEN: "Tufino, Via G.Verdi" },
    { name: "Sperone, Municipio", nameEN: "Sperone, Town Hall" },
    { name: "Baiano, Via N.delle Puglie 153", nameEN: "Baiano, Via N.delle Puglie 153" },
    { name: "Sirignano, Viale Michelangelo", nameEN: "Sirignano, Viale Michelangelo" },
    { name: "Mugnano del Cardinale, Via Roma", nameEN: "Mugnano del Cardinale, Via Roma" },
    { name: "Monteforte Irpino, Via Gaudi 32", nameEN: "Monteforte Irpino, Via Gaudi 32" },
    { name: "Monteforte Irpino, Via Gaudi 22", nameEN: "Monteforte Irpino, Via Gaudi 22" },
    { name: "Monteforte Irpino, Via Nazionale 133", nameEN: "Monteforte Irpino, Via Nazionale 133" },
    { name: "Monteforte Irpino, Via Nazionale 1 - Ospedale", nameEN: "Monteforte Irpino, Via Nazionale 1 - Hospital" },
    { name: "Monteforte Irpino, Via Alvanella 193", nameEN: "Monteforte Irpino, Via Alvanella 193" },
    { name: "Mercogliano, Via Nazionale Torrette - GS", nameEN: "Mercogliano, Via Nazionale Torrette - GS" },
    { name: "Mercogliano, Via Nazionale Torrette 122", nameEN: "Mercogliano, Via Nazionale Torrette 122" },
    { name: "Serino, Via Terminio, Svincolo Raccordo", nameEN: "Serino, Via Terminio, Highway Junction" },
    { name: "Solofra, Svincolo", nameEN: "Solofra Junction" },
    { name: "Fisciano, Terminal Bus", nameEN: "Fisciano Campus (Bus Terminal)" }
  ];

  const returnStopsData = [
    { name: "Fisciano, Terminal Bus", nameEN: "Fisciano Campus (Bus Terminal)" },
    { name: "Solofra, Svincolo", nameEN: "Solofra Junction" },
    { name: "Serino, Via Terminio Svincolo Raccordo", nameEN: "Serino, Via Terminio Highway Junction" },
    { name: "Mercogliano, Via Nazionale 43", nameEN: "Mercogliano, Via Nazionale 43" },
    { name: "Monteforte Irpino, Via Taverna Campanile Pensilina", nameEN: "Monteforte Irpino, Via Taverna Campanile Bus Shelter" },
    { name: "Monteforte Irpino, Via Nazionale 12 - Ospedale", nameEN: "Monteforte Irpino, Via Nazionale 12 - Hospital" },
    { name: "Monteforte Irpino, Via Nazionale 176", nameEN: "Monteforte Irpino, Via Nazionale 176" },
    { name: "Monteforte Irpino, Via Gaudi 41", nameEN: "Monteforte Irpino, Via Gaudi 41" },
    { name: "Mugnano del Cardinale, Via Vittorio Emanuele", nameEN: "Mugnano del Cardinale, Via Vittorio Emanuele" },
    { name: "Sirignano, Viale Michelangelo", nameEN: "Sirignano, Viale Michelangelo" },
    { name: "Baiano, Via Nazionale delle Puglie 157", nameEN: "Baiano, Via Nazionale delle Puglie 157" },
    { name: "Sperone, Cimitero", nameEN: "Sperone, Cemetery" },
    { name: "Sperone, Municipio", nameEN: "Sperone, Town Hall" },
    { name: "Avella, Purgatorio-Agip", nameEN: "Avella, Purgatorio-Agip" },
    { name: "Tufino, Via Cesina 18", nameEN: "Tufino, Via Cesina 18" },
    { name: "Cicciano, Via Puglie 6", nameEN: "Cicciano, Via Puglie 6" },
    { name: "Roccarainola, Via Matteotti", nameEN: "Roccarainola, Via Matteotti" }
  ];

  const runs: Run[] = [];

  // Outbound
  outboundRaw.forEach((raw, index) => {
    const stopsList: Stop[] = [];
    raw.t.forEach((time, stopIdx) => {
      if (time !== "") {
        stopsList.push({
          name: outboundStopsData[stopIdx].name,
          nameEN: outboundStopsData[stopIdx].nameEN,
          time
        });
      }
    });
    if (stopsList.length > 0) {
      runs.push({
        id: `23-a${index + 1}`,
        direction: 'Andata',
        directionLabelIT: 'Roccarainola ➔ Fisciano',
        directionLabelEN: 'Roccarainola ➔ Fisciano',
        departureTime: stopsList[0].time,
        stops: stopsList,
        periodCode: raw.p
      });
    }
  });

  // Return
  returnRaw.forEach((raw, index) => {
    const stopsList: Stop[] = [];
    raw.t.forEach((time, stopIdx) => {
      if (time !== "") {
        stopsList.push({
          name: returnStopsData[stopIdx].name,
          nameEN: returnStopsData[stopIdx].nameEN,
          time
        });
      }
    });
    if (stopsList.length > 0) {
      runs.push({
        id: `23-r${index + 1}`,
        direction: 'Ritorno',
        directionLabelIT: 'Fisciano ➔ Roccarainola',
        directionLabelEN: 'Fisciano ➔ Roccarainola',
        departureTime: stopsList[0].time,
        stops: stopsList,
        periodCode: raw.p
      });
    }
  });

  return runs;
};

export const busLines: BusLine[] = [
  {
    line: '7',
    routeIT: 'Stazione Salerno - Campus Fisciano',
    routeEN: 'Salerno Station - Fisciano Campus',
    platformIT: 'Terminal Bus Fisciano',
    platformEN: 'Fisciano Bus Terminal',
    category: 'Salerno',
    runs: [
      {
        id: '7-a1',
        direction: 'Andata',
        directionLabelIT: 'Salerno ➔ Fisciano',
        directionLabelEN: 'Salerno ➔ Fisciano',
        departureTime: '07:15',
        stops: [
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '07:15' },
          { name: 'Salerno Piazza Concordia', nameEN: 'Salerno Concordia Sq.', time: '07:20' },
          { name: 'Via Carmine (Piazza San Francesco)', nameEN: 'Via Carmine (San Francesco Sq.)', time: '07:30' },
          { name: 'Fratte (Semaforo)', nameEN: 'Fratte (Traffic light)', time: '07:40' },
          { name: 'Lancusi (Fermata Raccordo)', nameEN: 'Lancusi (Highway Stop)', time: '07:50' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '07:55' }
        ]
      },
      {
        id: '7-a2',
        direction: 'Andata',
        directionLabelIT: 'Salerno ➔ Fisciano',
        directionLabelEN: 'Salerno ➔ Fisciano',
        departureTime: '08:30',
        stops: [
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '08:30' },
          { name: 'Salerno Piazza Concordia', nameEN: 'Salerno Concordia Sq.', time: '08:35' },
          { name: 'Via Carmine (Piazza San Francesco)', nameEN: 'Via Carmine (San Francesco Sq.)', time: '08:45' },
          { name: 'Fratte (Semaforo)', nameEN: 'Fratte (Traffic light)', time: '08:55' },
          { name: 'Lancusi (Fermata Raccordo)', nameEN: 'Lancusi (Highway Stop)', time: '09:05' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '09:10' }
        ]
      },
      {
        id: '7-a3',
        direction: 'Andata',
        directionLabelIT: 'Salerno ➔ Fisciano',
        directionLabelEN: 'Salerno ➔ Fisciano',
        departureTime: '10:15',
        stops: [
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '10:15' },
          { name: 'Salerno Piazza Concordia', nameEN: 'Salerno Concordia Sq.', time: '10:20' },
          { name: 'Via Carmine (Piazza San Francesco)', nameEN: 'Via Carmine (San Francesco Sq.)', time: '10:30' },
          { name: 'Fratte (Semaforo)', nameEN: 'Fratte (Traffic light)', time: '10:40' },
          { name: 'Lancusi (Fermata Raccordo)', nameEN: 'Lancusi (Highway Stop)', time: '10:50' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '10:55' }
        ]
      },
      {
        id: '7-a4',
        direction: 'Andata',
        directionLabelIT: 'Salerno ➔ Fisciano',
        directionLabelEN: 'Salerno ➔ Fisciano',
        departureTime: '12:45',
        stops: [
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '12:45' },
          { name: 'Salerno Piazza Concordia', nameEN: 'Salerno Concordia Sq.', time: '12:50' },
          { name: 'Via Carmine (Piazza San Francesco)', nameEN: 'Via Carmine (San Francesco Sq.)', time: '13:00' },
          { name: 'Fratte (Semaforo)', nameEN: 'Fratte (Traffic light)', time: '13:10' },
          { name: 'Lancusi (Fermata Raccordo)', nameEN: 'Lancusi (Highway Stop)', time: '13:20' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '13:25' }
        ]
      },
      {
        id: '7-a5',
        direction: 'Andata',
        directionLabelIT: 'Salerno ➔ Fisciano',
        directionLabelEN: 'Salerno ➔ Fisciano',
        departureTime: '14:15',
        stops: [
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '14:15' },
          { name: 'Salerno Piazza Concordia', nameEN: 'Salerno Concordia Sq.', time: '14:20' },
          { name: 'Via Carmine (Piazza San Francesco)', nameEN: 'Via Carmine (San Francesco Sq.)', time: '14:30' },
          { name: 'Fratte (Semaforo)', nameEN: 'Fratte (Traffic light)', time: '14:40' },
          { name: 'Lancusi (Fermata Raccordo)', nameEN: 'Lancusi (Highway Stop)', time: '14:50' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '14:55' }
        ]
      },
      {
        id: '7-a6',
        direction: 'Andata',
        directionLabelIT: 'Salerno ➔ Fisciano',
        directionLabelEN: 'Salerno ➔ Fisciano',
        departureTime: '17:30',
        stops: [
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '17:30' },
          { name: 'Salerno Piazza Concordia', nameEN: 'Salerno Concordia Sq.', time: '17:35' },
          { name: 'Via Carmine (Piazza San Francesco)', nameEN: 'Via Carmine (San Francesco Sq.)', time: '17:45' },
          { name: 'Fratte (Semaforo)', nameEN: 'Fratte (Traffic light)', time: '17:55' },
          { name: 'Lancusi (Fermata Raccordo)', nameEN: 'Lancusi (Highway Stop)', time: '18:05' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '18:10' }
        ]
      },
      {
        id: '7-a7',
        direction: 'Andata',
        directionLabelIT: 'Salerno ➔ Fisciano',
        directionLabelEN: 'Salerno ➔ Fisciano',
        departureTime: '19:15',
        stops: [
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '19:15' },
          { name: 'Salerno Piazza Concordia', nameEN: 'Salerno Concordia Sq.', time: '19:20' },
          { name: 'Via Carmine (Piazza San Francesco)', nameEN: 'Via Carmine (San Francesco Sq.)', time: '19:30' },
          { name: 'Fratte (Semaforo)', nameEN: 'Fratte (Traffic light)', time: '19:40' },
          { name: 'Lancusi (Fermata Raccordo)', nameEN: 'Lancusi (Highway Stop)', time: '19:50' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '19:55' }
        ]
      },
      {
        id: '7-r1',
        direction: 'Ritorno',
        directionLabelIT: 'Fisciano ➔ Salerno',
        directionLabelEN: 'Fisciano ➔ Salerno',
        departureTime: '08:00',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '08:00' },
          { name: 'Lancusi (Raccordo Nord)', nameEN: 'Lancusi (Highway North)', time: '08:05' },
          { name: 'Fratte (Semaforo)', nameEN: 'Fratte (Traffic light)', time: '08:15' },
          { name: 'Via Carmine (Piazza San Francesco)', nameEN: 'Via Carmine (San Francesco Sq.)', time: '08:25' },
          { name: 'Salerno Piazza Concordia', nameEN: 'Salerno Concordia Sq.', time: '08:35' },
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '08:40' }
        ]
      },
      {
        id: '7-r2',
        direction: 'Ritorno',
        directionLabelIT: 'Fisciano ➔ Salerno',
        directionLabelEN: 'Fisciano ➔ Salerno',
        departureTime: '09:30',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '09:30' },
          { name: 'Lancusi (Raccordo Nord)', nameEN: 'Lancusi (Highway North)', time: '09:05' },
          { name: 'Fratte (Semaforo)', nameEN: 'Fratte (Traffic light)', time: '09:45' },
          { name: 'Via Carmine (Piazza San Francesco)', nameEN: 'Via Carmine (San Francesco Sq.)', time: '09:55' },
          { name: 'Salerno Piazza Concordia', nameEN: 'Salerno Concordia Sq.', time: '10:05' },
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '10:10' }
        ]
      },
      {
        id: '7-r3',
        direction: 'Ritorno',
        directionLabelIT: 'Fisciano ➔ Salerno',
        directionLabelEN: 'Fisciano ➔ Salerno',
        departureTime: '11:15',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '11:15' },
          { name: 'Lancusi (Raccordo Nord)', nameEN: 'Lancusi (Highway North)', time: '11:20' },
          { name: 'Fratte (Semaforo)', nameEN: 'Fratte (Traffic light)', time: '11:30' },
          { name: 'Via Carmine (Piazza San Francesco)', nameEN: 'Via Carmine (San Francesco Sq.)', time: '11:40' },
          { name: 'Salerno Piazza Concordia', nameEN: 'Salerno Concordia Sq.', time: '11:50' },
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '11:55' }
        ]
      },
      {
        id: '7-r4',
        direction: 'Ritorno',
        directionLabelIT: 'Fisciano ➔ Salerno',
        directionLabelEN: 'Fisciano ➔ Salerno',
        departureTime: '13:30',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '13:30' },
          { name: 'Lancusi (Raccordo Nord)', nameEN: 'Lancusi (Highway North)', time: '13:35' },
          { name: 'Fratte (Semaforo)', nameEN: 'Fratte (Traffic light)', time: '13:45' },
          { name: 'Via Carmine (Piazza San Francesco)', nameEN: 'Via Carmine (San Francesco Sq.)', time: '13:55' },
          { name: 'Salerno Piazza Concordia', nameEN: 'Salerno Concordia Sq.', time: '14:05' },
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '14:10' }
        ]
      },
      {
        id: '7-r5',
        direction: 'Ritorno',
        directionLabelIT: 'Fisciano ➔ Salerno',
        directionLabelEN: 'Fisciano ➔ Salerno',
        departureTime: '15:30',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '15:30' },
          { name: 'Lancusi (Raccordo Nord)', nameEN: 'Lancusi (Highway North)', time: '15:35' },
          { name: 'Fratte (Semaforo)', nameEN: 'Fratte (Traffic light)', time: '15:45' },
          { name: 'Via Carmine (Piazza San Francesco)', nameEN: 'Via Carmine (San Francesco Sq.)', time: '15:55' },
          { name: 'Salerno Piazza Concordia', nameEN: 'Salerno Concordia Sq.', time: '16:05' },
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '16:10' }
        ]
      },
      {
        id: '7-r6',
        direction: 'Ritorno',
        directionLabelIT: 'Fisciano ➔ Salerno',
        directionLabelEN: 'Fisciano ➔ Salerno',
        departureTime: '18:15',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '18:15' },
          { name: 'Lancusi (Raccordo Nord)', nameEN: 'Lancusi (Highway North)', time: '18:20' },
          { name: 'Fratte (Semaforo)', nameEN: 'Fratte (Traffic light)', time: '18:30' },
          { name: 'Via Carmine (Piazza San Francesco)', nameEN: 'Via Carmine (San Francesco Sq.)', time: '18:40' },
          { name: 'Salerno Piazza Concordia', nameEN: 'Salerno Concordia Sq.', time: '18:50' },
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '18:55' }
        ]
      },
      {
        id: '7-r7',
        direction: 'Ritorno',
        directionLabelIT: 'Fisciano ➔ Salerno',
        directionLabelEN: 'Fisciano ➔ Salerno',
        departureTime: '20:00',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '20:00' },
          { name: 'Lancusi (Raccordo Nord)', nameEN: 'Lancusi (Highway North)', time: '20:05' },
          { name: 'Fratte (Semaforo)', nameEN: 'Fratte (Traffic light)', time: '20:15' },
          { name: 'Via Carmine (Piazza San Francesco)', nameEN: 'Via Carmine (San Francesco Sq.)', time: '20:25' },
          { name: 'Salerno Piazza Concordia', nameEN: 'Salerno Concordia Sq.', time: '20:35' },
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '20:40' }
        ]
      }
    ]
  },
  {
    line: '17',
    routeIT: 'Salerno - Baronissi - Campus Fisciano',
    routeEN: 'Salerno - Baronissi - Fisciano Campus',
    platformIT: 'Terminal Bus Fisciano / Fermata Medicina Baronissi',
    platformEN: 'Fisciano Bus Terminal / Baronissi Medicine Stop',
    category: 'Salerno',
    runs: [
      {
        id: '17-a1',
        direction: 'Andata',
        directionLabelIT: 'Salerno ➔ Baronissi ➔ Fisciano',
        directionLabelEN: 'Salerno ➔ Baronissi ➔ Fisciano',
        departureTime: '07:00',
        stops: [
          { name: 'Salerno (Piazza San Francesco)', nameEN: 'Salerno (San Francesco Sq.)', time: '07:00' },
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '07:05' },
          { name: 'Fratte (Centro)', nameEN: 'Fratte (Center)', time: '07:15' },
          { name: 'Baronissi (Piazza Mercato)', nameEN: 'Baronissi (Market Sq.)', time: '07:30' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '07:35' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '07:45' }
        ]
      },
      {
        id: '17-a2',
        direction: 'Andata',
        directionLabelIT: 'Salerno ➔ Baronissi ➔ Fisciano',
        directionLabelEN: 'Salerno ➔ Baronissi ➔ Fisciano',
        departureTime: '08:00',
        stops: [
          { name: 'Salerno (Piazza San Francesco)', nameEN: 'Salerno (San Francesco Sq.)', time: '08:00' },
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '08:05' },
          { name: 'Fratte (Centro)', nameEN: 'Fratte (Center)', time: '08:15' },
          { name: 'Baronissi (Piazza Mercato)', nameEN: 'Baronissi (Market Sq.)', time: '08:30' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '08:35' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '08:45' }
        ]
      },
      {
        id: '17-a3',
        direction: 'Andata',
        directionLabelIT: 'Salerno ➔ Baronissi ➔ Fisciano',
        directionLabelEN: 'Salerno ➔ Baronissi ➔ Fisciano',
        departureTime: '09:00',
        stops: [
          { name: 'Salerno (Piazza San Francesco)', nameEN: 'Salerno (San Francesco Sq.)', time: '09:00' },
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '09:05' },
          { name: 'Fratte (Centro)', nameEN: 'Fratte (Center)', time: '09:15' },
          { name: 'Baronissi (Piazza Mercato)', nameEN: 'Baronissi (Market Sq.)', time: '09:30' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '09:35' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '09:45' }
        ]
      },
      {
        id: '17-a4',
        direction: 'Andata',
        directionLabelIT: 'Salerno ➔ Baronissi ➔ Fisciano',
        directionLabelEN: 'Salerno ➔ Baronissi ➔ Fisciano',
        departureTime: '11:00',
        stops: [
          { name: 'Salerno (Piazza San Francesco)', nameEN: 'Salerno (San Francesco Sq.)', time: '11:00' },
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '11:05' },
          { name: 'Fratte (Centro)', nameEN: 'Fratte (Center)', time: '11:15' },
          { name: 'Baronissi (Piazza Mercato)', nameEN: 'Baronissi (Market Sq.)', time: '11:30' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '11:35' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '11:45' }
        ]
      },
      {
        id: '17-a5',
        direction: 'Andata',
        directionLabelIT: 'Salerno ➔ Baronissi ➔ Fisciano',
        directionLabelEN: 'Salerno ➔ Baronissi ➔ Fisciano',
        departureTime: '13:10',
        stops: [
          { name: 'Salerno (Piazza San Francesco)', nameEN: 'Salerno (San Francesco Sq.)', time: '13:10' },
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '13:15' },
          { name: 'Fratte (Centro)', nameEN: 'Fratte (Center)', time: '13:25' },
          { name: 'Baronissi (Piazza Mercato)', nameEN: 'Baronissi (Market Sq.)', time: '13:40' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '13:45' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '13:55' }
        ]
      },
      {
        id: '17-a6',
        direction: 'Andata',
        directionLabelIT: 'Salerno ➔ Baronissi ➔ Fisciano',
        directionLabelEN: 'Salerno ➔ Baronissi ➔ Fisciano',
        departureTime: '15:00',
        stops: [
          { name: 'Salerno (Piazza San Francesco)', nameEN: 'Salerno (San Francesco Sq.)', time: '15:00' },
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '15:05' },
          { name: 'Fratte (Centro)', nameEN: 'Fratte (Center)', time: '15:15' },
          { name: 'Baronissi (Piazza Mercato)', nameEN: 'Baronissi (Market Sq.)', time: '15:30' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '15:35' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '15:45' }
        ]
      },
      {
        id: '17-a7',
        direction: 'Andata',
        directionLabelIT: 'Salerno ➔ Baronissi ➔ Fisciano',
        directionLabelEN: 'Salerno ➔ Baronissi ➔ Fisciano',
        departureTime: '17:00',
        stops: [
          { name: 'Salerno (Piazza San Francesco)', nameEN: 'Salerno (San Francesco Sq.)', time: '17:00' },
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '17:05' },
          { name: 'Fratte (Centro)', nameEN: 'Fratte (Center)', time: '17:15' },
          { name: 'Baronissi (Piazza Mercato)', nameEN: 'Baronissi (Market Sq.)', time: '17:30' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '17:35' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '17:45' }
        ]
      },
      {
        id: '17-a8',
        direction: 'Andata',
        directionLabelIT: 'Salerno ➔ Baronissi ➔ Fisciano',
        directionLabelEN: 'Salerno ➔ Baronissi ➔ Fisciano',
        departureTime: '18:30',
        stops: [
          { name: 'Salerno (Piazza San Francesco)', nameEN: 'Salerno (San Francesco Sq.)', time: '18:30' },
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '18:35' },
          { name: 'Fratte (Centro)', nameEN: 'Fratte (Center)', time: '18:45' },
          { name: 'Baronissi (Piazza Mercato)', nameEN: 'Baronissi (Market Sq.)', time: '19:00' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '19:05' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '19:15' }
        ]
      },
      {
        id: '17-r1',
        direction: 'Ritorno',
        directionLabelIT: 'Fisciano ➔ Baronissi ➔ Salerno',
        directionLabelEN: 'Fisciano ➔ Baronissi ➔ Salerno',
        departureTime: '08:00',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '08:00' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '08:10' },
          { name: 'Baronissi (Piazza Mercato)', nameEN: 'Baronissi (Market Sq.)', time: '08:15' },
          { name: 'Fratte (Centro)', nameEN: 'Fratte (Center)', time: '08:30' },
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '08:40' },
          { name: 'Salerno (Piazza San Francesco)', nameEN: 'Salerno (San Francesco Sq.)', time: '08:45' }
        ]
      },
      {
        id: '17-r2',
        direction: 'Ritorno',
        directionLabelIT: 'Fisciano ➔ Baronissi ➔ Salerno',
        directionLabelEN: 'Fisciano ➔ Baronissi ➔ Salerno',
        departureTime: '09:00',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '09:00' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '09:10' },
          { name: 'Baronissi (Piazza Mercato)', nameEN: 'Baronissi (Market Sq.)', time: '09:15' },
          { name: 'Fratte (Centro)', nameEN: 'Fratte (Center)', time: '09:30' },
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '09:40' },
          { name: 'Salerno (Piazza San Francesco)', nameEN: 'Salerno (San Francesco Sq.)', time: '09:45' }
        ]
      },
      {
        id: '17-r3',
        direction: 'Ritorno',
        directionLabelIT: 'Fisciano ➔ Baronissi ➔ Salerno',
        directionLabelEN: 'Fisciano ➔ Baronissi ➔ Salerno',
        departureTime: '10:00',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '10:00' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '10:10' },
          { name: 'Baronissi (Piazza Mercato)', nameEN: 'Baronissi (Market Sq.)', time: '10:15' },
          { name: 'Fratte (Centro)', nameEN: 'Fratte (Center)', time: '10:30' },
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '10:40' },
          { name: 'Salerno (Piazza San Francesco)', nameEN: 'Salerno (San Francesco Sq.)', time: '10:45' }
        ]
      },
      {
        id: '17-r4',
        direction: 'Ritorno',
        directionLabelIT: 'Fisciano ➔ Baronissi ➔ Salerno',
        directionLabelEN: 'Fisciano ➔ Baronissi ➔ Salerno',
        departureTime: '12:00',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '12:00' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '12:10' },
          { name: 'Baronissi (Piazza Mercato)', nameEN: 'Baronissi (Market Sq.)', time: '12:15' },
          { name: 'Fratte (Centro)', nameEN: 'Fratte (Center)', time: '12:30' },
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '12:40' },
          { name: 'Salerno (Piazza San Francesco)', nameEN: 'Salerno (San Francesco Sq.)', time: '12:45' }
        ]
      },
      {
        id: '17-r5',
        direction: 'Ritorno',
        directionLabelIT: 'Fisciano ➔ Baronissi ➔ Salerno',
        directionLabelEN: 'Fisciano ➔ Baronissi ➔ Salerno',
        departureTime: '14:00',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '14:00' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '14:10' },
          { name: 'Baronissi (Piazza Mercato)', nameEN: 'Baronissi (Market Sq.)', time: '14:15' },
          { name: 'Fratte (Centro)', nameEN: 'Fratte (Center)', time: '14:30' },
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '14:40' },
          { name: 'Salerno (Piazza San Francesco)', nameEN: 'Salerno (San Francesco Sq.)', time: '14:45' }
        ]
      },
      {
        id: '17-r6',
        direction: 'Ritorno',
        directionLabelIT: 'Fisciano ➔ Baronissi ➔ Salerno',
        directionLabelEN: 'Fisciano ➔ Baronissi ➔ Salerno',
        departureTime: '16:00',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '16:00' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '16:10' },
          { name: 'Baronissi (Piazza Mercato)', nameEN: 'Baronissi (Market Sq.)', time: '16:15' },
          { name: 'Fratte (Centro)', nameEN: 'Fratte (Center)', time: '16:30' },
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '16:40' },
          { name: 'Salerno (Piazza San Francesco)', nameEN: 'Salerno (San Francesco Sq.)', time: '16:45' }
        ]
      },
      {
        id: '17-r7',
        direction: 'Ritorno',
        directionLabelIT: 'Fisciano ➔ Baronissi ➔ Salerno',
        directionLabelEN: 'Fisciano ➔ Baronissi ➔ Salerno',
        departureTime: '18:00',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '18:00' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '18:10' },
          { name: 'Baronissi (Piazza Mercato)', nameEN: 'Baronissi (Market Sq.)', time: '18:15' },
          { name: 'Fratte (Centro)', nameEN: 'Fratte (Center)', time: '18:30' },
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '18:40' },
          { name: 'Salerno (Piazza San Francesco)', nameEN: 'Salerno (San Francesco Sq.)', time: '18:45' }
        ]
      },
      {
        id: '17-r8',
        direction: 'Ritorno',
        directionLabelIT: 'Fisciano ➔ Baronissi ➔ Salerno',
        directionLabelEN: 'Fisciano ➔ Baronissi ➔ Salerno',
        departureTime: '19:30',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '19:30' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '19:40' },
          { name: 'Baronissi (Piazza Mercato)', nameEN: 'Baronissi (Market Sq.)', time: '19:45' },
          { name: 'Fratte (Centro)', nameEN: 'Fratte (Center)', time: '20:00' },
          { name: 'Salerno Stazione', nameEN: 'Salerno Station', time: '20:10' },
          { name: 'Salerno (Piazza San Francesco)', nameEN: 'Salerno (San Francesco Sq.)', time: '20:15' }
        ]
      }
    ]
  },
  {
    line: '47',
    routeIT: 'Navetta Campus Fisciano ➔ Campus Baronissi',
    routeEN: 'Shuttle Fisciano Campus ➔ Baronissi Campus',
    platformIT: 'Terminal Bus Fisciano / Fermata Medicina Baronissi',
    platformEN: 'Fisciano Bus Terminal / Baronissi Medicine Stop',
    category: 'Campus',
    runs: [
      {
        id: '47-a1',
        direction: 'Andata',
        directionLabelIT: 'Fisciano ➔ Baronissi (Navetta)',
        directionLabelEN: 'Fisciano ➔ Baronissi (Shuttle)',
        departureTime: '08:30',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '08:30' },
          { name: 'Lancusi (Piazza)', nameEN: 'Lancusi (Square)', time: '08:38' },
          { name: 'Baronissi (Sava)', nameEN: 'Baronissi (Sava)', time: '08:45' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '08:50' }
        ]
      },
      {
        id: '47-a2',
        direction: 'Andata',
        directionLabelIT: 'Fisciano ➔ Baronissi (Navetta)',
        directionLabelEN: 'Fisciano ➔ Baronissi (Shuttle)',
        departureTime: '09:30',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '09:30' },
          { name: 'Lancusi (Piazza)', nameEN: 'Lancusi (Square)', time: '09:38' },
          { name: 'Baronissi (Sava)', nameEN: 'Baronissi (Sava)', time: '09:45' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '09:50' }
        ]
      },
      {
        id: '47-a3',
        direction: 'Andata',
        directionLabelIT: 'Fisciano ➔ Baronissi (Navetta)',
        directionLabelEN: 'Fisciano ➔ Baronissi (Shuttle)',
        departureTime: '10:30',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '10:30' },
          { name: 'Lancusi (Piazza)', nameEN: 'Lancusi (Square)', time: '10:38' },
          { name: 'Baronissi (Sava)', nameEN: 'Baronissi (Sava)', time: '10:45' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '10:50' }
        ]
      },
      {
        id: '47-a4',
        direction: 'Andata',
        directionLabelIT: 'Fisciano ➔ Baronissi (Navetta)',
        directionLabelEN: 'Fisciano ➔ Baronissi (Shuttle)',
        departureTime: '11:30',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '11:30' },
          { name: 'Lancusi (Piazza)', nameEN: 'Lancusi (Square)', time: '11:38' },
          { name: 'Baronissi (Sava)', nameEN: 'Baronissi (Sava)', time: '11:45' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '11:50' }
        ]
      },
      {
        id: '47-a5',
        direction: 'Andata',
        directionLabelIT: 'Fisciano ➔ Baronissi (Navetta)',
        directionLabelEN: 'Fisciano ➔ Baronissi (Shuttle)',
        departureTime: '12:30',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '12:30' },
          { name: 'Lancusi (Piazza)', nameEN: 'Lancusi (Square)', time: '12:38' },
          { name: 'Baronissi (Sava)', nameEN: 'Baronissi (Sava)', time: '12:45' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '12:50' }
        ]
      },
      {
        id: '47-a6',
        direction: 'Andata',
        directionLabelIT: 'Fisciano ➔ Baronissi (Navetta)',
        directionLabelEN: 'Fisciano ➔ Baronissi (Shuttle)',
        departureTime: '13:30',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '13:30' },
          { name: 'Lancusi (Piazza)', nameEN: 'Lancusi (Square)', time: '13:38' },
          { name: 'Baronissi (Sava)', nameEN: 'Baronissi (Sava)', time: '13:45' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '13:50' }
        ]
      },
      {
        id: '47-a7',
        direction: 'Andata',
        directionLabelIT: 'Fisciano ➔ Baronissi (Navetta)',
        directionLabelEN: 'Fisciano ➔ Baronissi (Shuttle)',
        departureTime: '14:30',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '14:30' },
          { name: 'Lancusi (Piazza)', nameEN: 'Lancusi (Square)', time: '14:38' },
          { name: 'Baronissi (Sava)', nameEN: 'Baronissi (Sava)', time: '14:45' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '14:50' }
        ]
      },
      {
        id: '47-a8',
        direction: 'Andata',
        directionLabelIT: 'Fisciano ➔ Baronissi (Navetta)',
        directionLabelEN: 'Fisciano ➔ Baronissi (Shuttle)',
        departureTime: '15:30',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '15:30' },
          { name: 'Lancusi (Piazza)', nameEN: 'Lancusi (Square)', time: '15:38' },
          { name: 'Baronissi (Sava)', nameEN: 'Baronissi (Sava)', time: '15:45' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '15:50' }
        ]
      },
      {
        id: '47-a9',
        direction: 'Andata',
        directionLabelIT: 'Fisciano ➔ Baronissi (Navetta)',
        directionLabelEN: 'Fisciano ➔ Baronissi (Shuttle)',
        departureTime: '16:30',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '16:30' },
          { name: 'Lancusi (Piazza)', nameEN: 'Lancusi (Square)', time: '16:38' },
          { name: 'Baronissi (Sava)', nameEN: 'Baronissi (Sava)', time: '16:45' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '16:50' }
        ]
      },
      {
        id: '47-a10',
        direction: 'Andata',
        directionLabelIT: 'Fisciano ➔ Baronissi (Navetta)',
        directionLabelEN: 'Fisciano ➔ Baronissi (Shuttle)',
        departureTime: '17:30',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '17:30' },
          { name: 'Lancusi (Piazza)', nameEN: 'Lancusi (Square)', time: '17:38' },
          { name: 'Baronissi (Sava)', nameEN: 'Baronissi (Sava)', time: '17:45' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '17:50' }
        ]
      },
      {
        id: '47-a11',
        direction: 'Andata',
        directionLabelIT: 'Fisciano ➔ Baronissi (Navetta)',
        directionLabelEN: 'Fisciano ➔ Baronissi (Shuttle)',
        departureTime: '18:30',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '18:30' },
          { name: 'Lancusi (Piazza)', nameEN: 'Lancusi (Square)', time: '18:38' },
          { name: 'Baronissi (Sava)', nameEN: 'Baronissi (Sava)', time: '18:45' },
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '18:50' }
        ]
      },
      {
        id: '47-r1',
        direction: 'Ritorno',
        directionLabelIT: 'Baronissi ➔ Fisciano (Navetta)',
        directionLabelEN: 'Baronissi ➔ Fisciano (Shuttle)',
        departureTime: '09:00',
        stops: [
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '09:00' },
          { name: 'Baronissi (Sava)', nameEN: 'Baronissi (Sava)', time: '09:05' },
          { name: 'Lancusi (Piazza)', nameEN: 'Lancusi (Square)', time: '09:12' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '09:20' }
        ]
      },
      {
        id: '47-r2',
        direction: 'Ritorno',
        directionLabelIT: 'Baronissi ➔ Fisciano (Navetta)',
        directionLabelEN: 'Baronissi ➔ Fisciano (Shuttle)',
        departureTime: '10:00',
        stops: [
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '10:00' },
          { name: 'Baronissi (Sava)', nameEN: 'Baronissi (Sava)', time: '10:05' },
          { name: 'Lancusi (Piazza)', nameEN: 'Lancusi (Square)', time: '10:12' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '10:20' }
        ]
      },
      {
        id: '47-r3',
        direction: 'Ritorno',
        directionLabelIT: 'Baronissi ➔ Fisciano (Navetta)',
        directionLabelEN: 'Baronissi ➔ Fisciano (Shuttle)',
        departureTime: '11:00',
        stops: [
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '11:00' },
          { name: 'Baronissi (Sava)', nameEN: 'Baronissi (Sava)', time: '11:05' },
          { name: 'Lancusi (Piazza)', nameEN: 'Lancusi (Square)', time: '11:12' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '11:20' }
        ]
      },
      {
        id: '47-r4',
        direction: 'Ritorno',
        directionLabelIT: 'Baronissi ➔ Fisciano (Navetta)',
        directionLabelEN: 'Baronissi ➔ Fisciano (Shuttle)',
        departureTime: '12:00',
        stops: [
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '12:00' },
          { name: 'Baronissi (Sava)', nameEN: 'Baronissi (Sava)', time: '12:05' },
          { name: 'Lancusi (Piazza)', nameEN: 'Lancusi (Square)', time: '12:12' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '12:20' }
        ]
      },
      {
        id: '47-r5',
        direction: 'Ritorno',
        directionLabelIT: 'Baronissi ➔ Fisciano (Navetta)',
        directionLabelEN: 'Baronissi ➔ Fisciano (Shuttle)',
        departureTime: '13:00',
        stops: [
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '13:00' },
          { name: 'Baronissi (Sava)', nameEN: 'Baronissi (Sava)', time: '13:05' },
          { name: 'Lancusi (Piazza)', nameEN: 'Lancusi (Square)', time: '13:12' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '13:20' }
        ]
      },
      {
        id: '47-r6',
        direction: 'Ritorno',
        directionLabelIT: 'Baronissi ➔ Fisciano (Navetta)',
        directionLabelEN: 'Baronissi ➔ Fisciano (Shuttle)',
        departureTime: '14:00',
        stops: [
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '14:00' },
          { name: 'Baronissi (Sava)', nameEN: 'Baronissi (Sava)', time: '14:05' },
          { name: 'Lancusi (Piazza)', nameEN: 'Lancusi (Square)', time: '14:12' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '14:20' }
        ]
      },
      {
        id: '47-r7',
        direction: 'Ritorno',
        directionLabelIT: 'Baronissi ➔ Fisciano (Navetta)',
        directionLabelEN: 'Baronissi ➔ Fisciano (Shuttle)',
        departureTime: '15:00',
        stops: [
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '15:00' },
          { name: 'Baronissi (Sava)', nameEN: 'Baronissi (Sava)', time: '15:05' },
          { name: 'Lancusi (Piazza)', nameEN: 'Lancusi (Square)', time: '15:12' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '15:20' }
        ]
      },
      {
        id: '47-r8',
        direction: 'Ritorno',
        directionLabelIT: 'Baronissi ➔ Fisciano (Navetta)',
        directionLabelEN: 'Baronissi ➔ Fisciano (Shuttle)',
        departureTime: '16:00',
        stops: [
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '16:00' },
          { name: 'Baronissi (Sava)', nameEN: 'Baronissi (Sava)', time: '16:05' },
          { name: 'Lancusi (Piazza)', nameEN: 'Lancusi (Square)', time: '16:12' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '16:20' }
        ]
      },
      {
        id: '47-r9',
        direction: 'Ritorno',
        directionLabelIT: 'Baronissi ➔ Fisciano (Navetta)',
        directionLabelEN: 'Baronissi ➔ Fisciano (Shuttle)',
        departureTime: '17:00',
        stops: [
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '17:00' },
          { name: 'Baronissi (Sava)', nameEN: 'Baronissi (Sava)', time: '17:05' },
          { name: 'Lancusi (Piazza)', nameEN: 'Lancusi (Square)', time: '17:12' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '17:20' }
        ]
      },
      {
        id: '47-r10',
        direction: 'Ritorno',
        directionLabelIT: 'Baronissi ➔ Fisciano (Navetta)',
        directionLabelEN: 'Baronissi ➔ Fisciano (Shuttle)',
        departureTime: '18:00',
        stops: [
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '18:00' },
          { name: 'Baronissi (Sava)', nameEN: 'Baronissi (Sava)', time: '18:05' },
          { name: 'Lancusi (Piazza)', nameEN: 'Lancusi (Square)', time: '18:12' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '18:20' }
        ]
      },
      {
        id: '47-r11',
        direction: 'Ritorno',
        directionLabelIT: 'Baronissi ➔ Fisciano (Navetta)',
        directionLabelEN: 'Baronissi ➔ Fisciano (Shuttle)',
        departureTime: '19:00',
        stops: [
          { name: 'Campus Baronissi (Medicina)', nameEN: 'Baronissi Campus (Medicine)', time: '19:00' },
          { name: 'Baronissi (Sava)', nameEN: 'Baronissi (Sava)', time: '19:05' },
          { name: 'Lancusi (Piazza)', nameEN: 'Lancusi (Square)', time: '19:12' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '19:20' }
        ]
      }
    ]
  },
  {
    line: '10',
    routeIT: 'Mercato S. Severino - Campus Fisciano',
    routeEN: 'Mercato S. Severino - Fisciano Campus',
    platformIT: 'Terminal Bus Fisciano',
    platformEN: 'Fisciano Bus Terminal',
    category: 'Cava-Nocera-Paesi Vesuviani',
    runs: [
      {
        id: '10-a1',
        direction: 'Andata',
        directionLabelIT: 'Mercato S. Severino ➔ Fisciano',
        directionLabelEN: 'Mercato S. Severino ➔ Fisciano',
        departureTime: '07:30',
        stops: [
          { name: 'Mercato S. Severino (Stazione)', nameEN: 'Mercato S. Severino (Station)', time: '07:30' },
          { name: 'Mercato S. Severino (Piazza del Galdo)', nameEN: 'Mercato S. Severino (Piazza del Galdo)', time: '07:37' },
          { name: 'Fisciano (Piazza)', nameEN: 'Fisciano (Square)', time: '07:44' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '07:50' }
        ]
      },
      {
        id: '10-a2',
        direction: 'Andata',
        directionLabelIT: 'Mercato S. Severino ➔ Fisciano',
        directionLabelEN: 'Mercato S. Severino ➔ Fisciano',
        departureTime: '08:30',
        stops: [
          { name: 'Mercato S. Severino (Stazione)', nameEN: 'Mercato S. Severino (Station)', time: '08:30' },
          { name: 'Mercato S. Severino (Piazza del Galdo)', nameEN: 'Mercato S. Severino (Piazza del Galdo)', time: '08:37' },
          { name: 'Fisciano (Piazza)', nameEN: 'Fisciano (Square)', time: '08:44' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '08:50' }
        ]
      },
      {
        id: '10-a3',
        direction: 'Andata',
        directionLabelIT: 'Mercato S. Severino ➔ Fisciano',
        directionLabelEN: 'Mercato S. Severino ➔ Fisciano',
        departureTime: '09:30',
        stops: [
          { name: 'Mercato S. Severino (Stazione)', nameEN: 'Mercato S. Severino (Station)', time: '09:30' },
          { name: 'Mercato S. Severino (Piazza del Galdo)', nameEN: 'Mercato S. Severino (Piazza del Galdo)', time: '09:37' },
          { name: 'Fisciano (Piazza)', nameEN: 'Fisciano (Square)', time: '09:44' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '09:50' }
        ]
      },
      {
        id: '10-a4',
        direction: 'Andata',
        directionLabelIT: 'Mercato S. Severino ➔ Fisciano',
        directionLabelEN: 'Mercato S. Severino ➔ Fisciano',
        departureTime: '11:30',
        stops: [
          { name: 'Mercato S. Severino (Stazione)', nameEN: 'Mercato S. Severino (Station)', time: '11:30' },
          { name: 'Mercato S. Severino (Piazza del Galdo)', nameEN: 'Mercato S. Severino (Piazza del Galdo)', time: '11:37' },
          { name: 'Fisciano (Piazza)', nameEN: 'Fisciano (Square)', time: '11:44' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '11:50' }
        ]
      },
      {
        id: '10-a5',
        direction: 'Andata',
        directionLabelIT: 'Mercato S. Severino ➔ Fisciano',
        directionLabelEN: 'Mercato S. Severino ➔ Fisciano',
        departureTime: '13:30',
        stops: [
          { name: 'Mercato S. Severino (Stazione)', nameEN: 'Mercato S. Severino (Station)', time: '13:30' },
          { name: 'Mercato S. Severino (Piazza del Galdo)', nameEN: 'Mercato S. Severino (Piazza del Galdo)', time: '13:37' },
          { name: 'Fisciano (Piazza)', nameEN: 'Fisciano (Square)', time: '13:44' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '13:50' }
        ]
      },
      {
        id: '10-a6',
        direction: 'Andata',
        directionLabelIT: 'Mercato S. Severino ➔ Fisciano',
        directionLabelEN: 'Mercato S. Severino ➔ Fisciano',
        departureTime: '15:30',
        stops: [
          { name: 'Mercato S. Severino (Stazione)', nameEN: 'Mercato S. Severino (Station)', time: '15:30' },
          { name: 'Mercato S. Severino (Piazza del Galdo)', nameEN: 'Mercato S. Severino (Piazza del Galdo)', time: '15:37' },
          { name: 'Fisciano (Piazza)', nameEN: 'Fisciano (Square)', time: '15:44' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '15:50' }
        ]
      },
      {
        id: '10-a7',
        direction: 'Andata',
        directionLabelIT: 'Mercato S. Severino ➔ Fisciano',
        directionLabelEN: 'Mercato S. Severino ➔ Fisciano',
        departureTime: '17:30',
        stops: [
          { name: 'Mercato S. Severino (Stazione)', nameEN: 'Mercato S. Severino (Station)', time: '17:30' },
          { name: 'Mercato S. Severino (Piazza del Galdo)', nameEN: 'Mercato S. Severino (Piazza del Galdo)', time: '17:37' },
          { name: 'Fisciano (Piazza)', nameEN: 'Fisciano (Square)', time: '17:44' },
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '17:50' }
        ]
      },
      {
        id: '10-r1',
        direction: 'Ritorno',
        directionLabelIT: 'Fisciano ➔ Mercato S. Severino',
        directionLabelEN: 'Fisciano ➔ Mercato S. Severino',
        departureTime: '08:00',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '08:00' },
          { name: 'Fisciano (Piazza)', nameEN: 'Fisciano (Square)', time: '08:06' },
          { name: 'Mercato S. Severino (Piazza del Galdo)', nameEN: 'Mercato S. Severino (Piazza del Galdo)', time: '08:13' },
          { name: 'Mercato S. Severino (Stazione)', nameEN: 'Mercato S. Severino (Station)', time: '08:20' }
        ]
      },
      {
        id: '10-r2',
        direction: 'Ritorno',
        directionLabelIT: 'Fisciano ➔ Mercato S. Severino',
        directionLabelEN: 'Fisciano ➔ Mercato S. Severino',
        departureTime: '09:00',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '09:00' },
          { name: 'Fisciano (Piazza)', nameEN: 'Fisciano (Square)', time: '09:06' },
          { name: 'Mercato S. Severino (Piazza del Galdo)', nameEN: 'Mercato S. Severino (Piazza del Galdo)', time: '09:13' },
          { name: 'Mercato S. Severino (Stazione)', nameEN: 'Mercato S. Severino (Station)', time: '09:20' }
        ]
      },
      {
        id: '10-r3',
        direction: 'Ritorno',
        directionLabelIT: 'Fisciano ➔ Mercato S. Severino',
        directionLabelEN: 'Fisciano ➔ Mercato S. Severino',
        departureTime: '10:00',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '10:00' },
          { name: 'Fisciano (Piazza)', nameEN: 'Fisciano (Square)', time: '10:06' },
          { name: 'Mercato S. Severino (Piazza del Galdo)', nameEN: 'Mercato S. Severino (Piazza del Galdo)', time: '10:13' },
          { name: 'Mercato S. Severino (Stazione)', nameEN: 'Mercato S. Severino (Station)', time: '10:20' }
        ]
      },
      {
        id: '10-r4',
        direction: 'Ritorno',
        directionLabelIT: 'Fisciano ➔ Mercato S. Severino',
        directionLabelEN: 'Fisciano ➔ Mercato S. Severino',
        departureTime: '12:00',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '12:00' },
          { name: 'Fisciano (Piazza)', nameEN: 'Fisciano (Square)', time: '12:06' },
          { name: 'Mercato S. Severino (Piazza del Galdo)', nameEN: 'Mercato S. Severino (Piazza del Galdo)', time: '12:13' },
          { name: 'Mercato S. Severino (Stazione)', nameEN: 'Mercato S. Severino (Station)', time: '12:20' }
        ]
      },
      {
        id: '10-r5',
        direction: 'Ritorno',
        directionLabelIT: 'Fisciano ➔ Mercato S. Severino',
        directionLabelEN: 'Fisciano ➔ Mercato S. Severino',
        departureTime: '14:00',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '14:00' },
          { name: 'Fisciano (Piazza)', nameEN: 'Fisciano (Square)', time: '14:06' },
          { name: 'Mercato S. Severino (Piazza del Galdo)', nameEN: 'Mercato S. Severino (Piazza del Galdo)', time: '14:13' },
          { name: 'Mercato S. Severino (Stazione)', nameEN: 'Mercato S. Severino (Station)', time: '14:20' }
        ]
      },
      {
        id: '10-r6',
        direction: 'Ritorno',
        directionLabelIT: 'Fisciano ➔ Mercato S. Severino',
        directionLabelEN: 'Fisciano ➔ Mercato S. Severino',
        departureTime: '16:00',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '16:00' },
          { name: 'Fisciano (Piazza)', nameEN: 'Fisciano (Square)', time: '16:06' },
          { name: 'Mercato S. Severino (Piazza del Galdo)', nameEN: 'Mercato S. Severino (Piazza del Galdo)', time: '16:13' },
          { name: 'Mercato S. Severino (Stazione)', nameEN: 'Mercato S. Severino (Station)', time: '16:20' }
        ]
      },
      {
        id: '10-r7',
        direction: 'Ritorno',
        directionLabelIT: 'Fisciano ➔ Mercato S. Severino',
        directionLabelEN: 'Fisciano ➔ Mercato S. Severino',
        departureTime: '18:00',
        stops: [
          { name: 'Campus Fisciano (Terminal Bus)', nameEN: 'Fisciano Campus (Bus Terminal)', time: '18:00' },
          { name: 'Fisciano (Piazza)', nameEN: 'Fisciano (Square)', time: '18:06' },
          { name: 'Mercato S. Severino (Piazza del Galdo)', nameEN: 'Mercato S. Severino (Piazza del Galdo)', time: '18:13' },
          { name: 'Mercato S. Severino (Stazione)', nameEN: 'Mercato S. Severino (Station)', time: '18:20' }
        ]
      }
    ]
  },
  {
    line: '14',
    routeIT: 'Avellino - Solofra - Fisciano',
    routeEN: 'Avellino - Solofra - Fisciano',
    platformIT: 'Avellino Autostazione Air / Terminal Bus Fisciano',
    platformEN: 'Avellino Air Bus Station / Fisciano Bus Terminal',
    category: 'Avellino',
    runs: buildLine14Runs()
  },
  {
    line: '9',
    routeIT: 'Senerchia - Calabritto - Lioni - Fisciano',
    routeEN: 'Senerchia - Calabritto - Lioni - Fisciano',
    platformIT: 'Senerchia Capolinea / Terminal Bus Fisciano',
    platformEN: 'Senerchia Terminus / Fisciano Bus Terminal',
    category: 'Avellino',
    runs: buildLine09Runs()
  },
  {
    line: '23',
    routeIT: 'Roccarainola - Sirignano - Monteforte - Fisciano',
    routeEN: 'Roccarainola - Sirignano - Monteforte - Fisciano',
    platformIT: 'Nola, bar Cardarelli / Terminal Bus Fisciano',
    platformEN: 'Nola, Bar Cardarelli / Fisciano Bus Terminal',
    category: 'Avellino',
    runs: buildLine23Runs()
  }
];
