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
}

export interface BusLine {
  line: string;
  routeIT: string;
  routeEN: string;
  platformIT: string;
  platformEN: string;
  runs: Run[];
}

export const busLines: BusLine[] = [
  {
    line: '7',
    routeIT: 'Stazione Salerno - Campus Fisciano',
    routeEN: 'Salerno Station - Fisciano Campus',
    platformIT: 'Terminal Bus Fisciano',
    platformEN: 'Fisciano Bus Terminal',
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
  }
];
