<template>
  <div class="dashboard">

    <aside class="sidebar" :class="{ 'sidebar-open': mobilniMeni }">
      <div class="sidebar-logo">
        <img src="../assets/logo.png" alt="logo" class="logo-img" />
      </div>
      <nav class="sidebar-nav">
        <button class="nav-item" :class="{ active: prikaz === 'dashboard' }" @click="odaberiPrikaz('dashboard')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          <span>DASHBOARD</span>
        </button>
        <button class="nav-item" :class="{ active: prikaz === 'izazovi' }" @click="odaberiPrikaz('izazovi')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/></svg>
          <span>IZAZOVI</span>
        </button>
        <button class="nav-item" :class="{ active: prikaz === 'treninzi' }" @click="odaberiPrikaz('treninzi')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.5 6.5 17.5 17.5M8 4l-4 4 12 12 4-4z"/><path d="M2 22l3-3M16 8l3-3"/></svg>
          <span>TRENINZI</span>
        </button>
        <button class="nav-item" :class="{ active: prikaz === 'recepti' }" @click="odaberiPrikaz('recepti')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2V2M5 2v20M17 2c-2 3-2 8 0 11v9"/></svg>
          <span>RECEPTI</span>
        </button>
      </nav>
    </aside>

    <div v-if="mobilniMeni" class="overlay" @click="mobilniMeni = false"></div>

    <main class="glavni">
      <header class="header">
        <button class="hamburger" @click="mobilniMeni = !mobilniMeni">
          <span></span><span></span><span></span>
        </button>
        <h1 class="header-naslov">{{ naslovi[prikaz] }}</h1>
        <OdjavaKrug />
      </header>

      <div v-if="prikaz === 'dashboard'" class="sadrzaj">
        <div class="sekcija-naslov">TRENUTNO U TERETANI ({{ trenutnoUTeretani.length }})</div>
        <div v-if="ucitavanjeTeretana" class="ucitavanje"><div class="spinner"></div></div>
        <div v-else class="lista-kartica lista-kartica-margin">
          <div v-if="trenutnoUTeretani.length === 0" class="prazno">Trenutno nema nikoga u teretani.</div>
          <div v-for="t in trenutnoUTeretani" :key="t.korisnikId" class="red-teretana">
            <span>{{ t.ime }}</span>
            <span class="red-teretana-vrijeme">od {{ formatirajVrijemeUlaska(t.vrijemeUlaska) }}</span>
          </div>
        </div>

        <div class="sekcija-naslov">FEEDBACK</div>
        <div v-if="ucitavanjeFeedback" class="ucitavanje"><div class="spinner"></div></div>
        <div v-else class="lista-kartica lista-kartica-margin">
          <div v-if="feedback.length === 0" class="prazno">Nema poslanog feedbacka.</div>
          <div v-for="f in feedback" :key="f._id" class="red-feedback" :class="{ 'red-feedback-neprocitano': !f.procitano }">
            <div class="feedback-info">
              <div class="feedback-glavno">
                <span class="feedback-ime">{{ f.korisnikId?.ime || 'Nepoznat korisnik' }}</span>
                <span class="feedback-datum">{{ formatirajDatum(f.createdAt) }}</span>
              </div>
              <p class="feedback-tekst">{{ f.tekst }}</p>
            </div>
            <div class="feedback-akcije">
              <button v-if="!f.procitano" class="gumb-oznaci" @click="oznaciProcitano(f)">Označi pročitano</button>
              <button class="gumb-obrisi" @click="obrisiFeedback(f)" title="Obriši">✕</button>
            </div>
          </div>
        </div>

        <div class="sekcija-naslov">OBAVIJESTI</div>
        <div class="forma-obavijest">
          <input v-model="novaObavijest" placeholder="Napiši novu obavijest..." @keyup.enter="dodajObavijest" />
          <button class="gumb-dodaj-obavijest" :disabled="!novaObavijest.trim() || spremanjeObavijesti" @click="dodajObavijest">Objavi</button>
        </div>
        <div class="lista-kartica">
          <div v-if="obavijesti.length === 0" class="prazno">Nema obavijesti.</div>
          <div v-for="o in obavijesti" :key="o._id" class="red-obavijest">
            <div class="obavijest-info">
              <p>{{ o.tekst }}</p>
              <span>{{ formatirajDatum(o.createdAt) }}</span>
            </div>
            <button class="gumb-obrisi" @click="obrisiObavijestAdmin(o)" title="Obriši">✕</button>
          </div>
        </div>
      </div>

      <div v-if="prikaz === 'izazovi' && korak === 'lista'" class="sadrzaj">
        <div class="tabovi">
          <button class="tab" :class="{ 'tab-aktivan': tab === 'aktivni' }" @click="tab = 'aktivni'">
            Pregled aktivnih izazova
          </button>
          <button class="tab" :class="{ 'tab-aktivan': tab === 'prosli' }" @click="tab = 'prosli'">
            Pregled prijašnjih izazova
          </button>
        </div>

        <div v-if="ucitavanje" class="ucitavanje"><div class="spinner"></div></div>

        <div v-else class="lista-kartica">
          <div v-if="prikazaniIzazovi.length === 0" class="prazno">
            Nema {{ tab === 'aktivni' ? 'aktivnih' : 'prijašnjih' }} izazova.
          </div>
          <div v-for="i in prikazaniIzazovi" :key="i._id" class="red-izazova" :class="{ 'red-prosli': tab === 'prosli' }">
            <div class="red-info">
              <span class="red-naziv">
                <span v-if="tab === 'aktivni'" class="lampica-aktivna" title="Aktivan"></span>
                {{ i.naziv }}
              </span>
              <span class="red-meta">{{ i.vrsta === 'tim' ? 'Timski' : 'Solo' }} · {{ i.nacin === 'dnevno' ? 'Dnevno' : 'Slobodno' }} · {{ formatirajDatum(i.pocetak) }} – {{ formatirajDatum(i.kraj) }}</span>
            </div>
            <div class="red-akcije">
              <button class="gumb-uredi" @click="otvoriUredjivanje(i)">Uredi</button>
              <button class="gumb-obrisi" @click="obrisiIzazov(i)" title="Obriši">✕</button>
            </div>
          </div>

          <button class="gumb-dodaj-novi" @click="korak = 'tip'">DODAJ NOVI</button>
        </div>
      </div>

      <div v-if="prikaz === 'izazovi' && korak === 'tip'" class="sadrzaj">
        <button class="gumb-nazad" @click="korak = 'lista'">‹ Nazad</button>
        <div class="tip-grid">
          <button class="tip-kartica" @click="odaberiVrstu('solo')">
            <div class="tip-naslov">SOLO IZAZOVI</div>
            <p class="tip-opis">Svaki korisnik se natječe sam za sebe. Bodovi se računaju iz njegovih vlastitih aktivnosti nakon što se pridruži izazovu.</p>
          </button>
          <button class="tip-kartica" @click="odaberiVrstu('tim')">
            <div class="tip-naslov">TIMSKI IZAZOVI</div>
            <p class="tip-opis">Korisnici se sami pridružuju postojećem timu ili stvaraju novi unutar izazova. Bodovi tima su zbroj bodova svih članova, a svaki se član i dalje boduje pojedinačno na temelju svojih aktivnosti.</p>
          </button>
        </div>
      </div>

      <div v-if="prikaz === 'izazovi' && korak === 'forma'" class="sadrzaj">
        <button class="gumb-nazad" @click="korak = uredjujeSeId ? 'lista' : 'tip'">‹ Nazad</button>

        <div class="forma-kartica">
          <div class="forma-red">
            <label class="forma-label">Naziv izazova</label>
            <input v-model="forma.naziv" class="forma-input" placeholder="npr. Ljetni izazov trčanja" />
          </div>

          <div class="forma-red">
            <label class="forma-label">Opis</label>
            <textarea v-model="forma.opis" class="forma-textarea" placeholder="Kratak opis izazova (opcionalno)"></textarea>
          </div>

          <div class="forma-red forma-red-dvije">
            <div>
              <label class="forma-label">Početak</label>
              <input v-model="forma.pocetak" type="date" lang="hr-HR" class="forma-input" />
            </div>
            <div>
              <label class="forma-label">Kraj</label>
              <input v-model="forma.kraj" type="date" lang="hr-HR" class="forma-input" />
            </div>
          </div>

          <div class="forma-red">
            <label class="forma-label">Vrsta izazova</label>
            <div class="vrsta-oznaka">{{ forma.vrsta === 'tim' ? 'Timski' : 'Solo' }}</div>
          </div>

          <div v-if="forma.vrsta === 'tim'" class="forma-red">
            <label class="forma-label">Veličina tima</label>
            <div class="velicina-izbor">
              <button
                type="button"
                class="velicina-gumb"
                :class="{ 'velicina-aktivan': velicinaTimaMod === 'par' }"
                @click="velicinaTimaMod = 'par'"
              >
                Parovi — točno 2 člana
              </button>
              <button
                type="button"
                class="velicina-gumb"
                :class="{ 'velicina-aktivan': velicinaTimaMod === 'neograniceno' }"
                @click="velicinaTimaMod = 'neograniceno'"
              >
                Neograničeno
              </button>
            </div>
            <p class="nacin-opis">
              <template v-if="velicinaTimaMod === 'par'">Timovi imaju točno dva člana — kad se popune, više se ne mogu birati.</template>
              <template v-else>Timovi mogu imati bilo koji broj članova.</template>
            </p>
          </div>

          <div class="forma-red">
            <label class="forma-label">Način izazova</label>
            <div class="nacin-izbor">
              <button
                type="button"
                class="nacin-gumb"
                :class="{ 'nacin-aktivan': forma.nacin === 'kumulativno' }"
                @click="forma.nacin = 'kumulativno'"
              >
                Slobodno — tko više/bolje
              </button>
              <button
                type="button"
                class="nacin-gumb"
                :class="{ 'nacin-aktivan': forma.nacin === 'dnevno' }"
                @click="forma.nacin = 'dnevno'"
              >
                Dnevno — mora se raditi svaki dan
              </button>
            </div>
            <p class="nacin-opis">
              <template v-if="forma.nacin === 'dnevno'">
                Član mora ispuniti barem jedno od odabranih pravila svaki dan trajanja izazova. Ako preskoči dan, ispada iz izazova.
              </template>
              <template v-else>
                Nema dnevnog uvjeta — bodovi se skupljaju kroz cijelo trajanje izazova, pobjeđuje tko skupi najviše.
              </template>
            </p>
          </div>

          <div class="forma-red">
            <label class="forma-label">Aktivnosti u izazovu</label>
            <div class="aktivnosti-lista">
              <div v-for="t in TIPOVI" :key="t.tip" class="aktivnost-stavka">
                <label class="checkbox-red">
                  <input type="checkbox" v-model="uvjetiForma[t.tip].odabran" />
                  <span>{{ t.naziv }}</span>
                </label>

                <div v-if="uvjetiForma[t.tip].odabran" class="uvjet-sekcija">
                  <div v-for="(pravilo, idx) in uvjetiForma[t.tip].pravila" :key="idx" class="pravilo-blok">
                    <div class="uvjet-polja">
                      <div class="uvjet-polje">
                        <label>Mjera</label>
                        <select v-model="pravilo.mjera">
                          <option value="km">Kilometri</option>
                          <option value="vrijeme">Vrijeme (min)</option>
                          <option value="kalorije">Kalorije</option>
                          <option value="elevacija">Visinska razlika (m)</option>
                          <option value="broj">Broj aktivnosti</option>
                        </select>
                      </div>
                      <div class="uvjet-polje">
                        <label>Svakih (cilj)</label>
                        <input type="number" min="0" step="0.1" v-model.number="pravilo.cilj" placeholder="npr. 5" />
                      </div>
                      <div class="uvjet-polje">
                        <label>Bodova</label>
                        <input type="number" min="0" v-model.number="pravilo.bodovi" placeholder="npr. 5" />
                      </div>
                      <button
                        v-if="uvjetiForma[t.tip].pravila.length > 1"
                        class="gumb-ukloni-pravilo"
                        @click="ukloniPravilo(t.tip, idx)"
                        title="Ukloni pravilo"
                      >✕</button>
                    </div>
                    <div class="uvjet-napomena">{{ opisPravila(pravilo) }}</div>
                  </div>

                  <button class="gumb-dodaj-pravilo" @click="dodajPravilo(t.tip)">+ Dodaj dodatno pravilo (zbraja se)</button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="greska" class="poruka-greska">{{ greska }}</div>

          <button class="gumb-spremi" @click="spremiIzazov" :disabled="spremanje">
            {{ spremanje ? 'Spremam...' : (uredjujeSeId ? 'SPREMI PROMJENE' : 'DODAJ IZAZOV') }}
          </button>
        </div>
      </div>

      <div v-if="prikaz === 'treninzi'" class="podprikaz-tabovi">
        <button class="podprikaz-tab" :class="{ 'podprikaz-tab-aktivan': vjPodprikaz === 'vjezbe' }" @click="vjPodprikaz = 'vjezbe'">VJEŽBE</button>
        <button class="podprikaz-tab" :class="{ 'podprikaz-tab-aktivan': vjPodprikaz === 'treninzi' }" @click="odaberiPodprikazTreninzi">TRENINZI</button>
      </div>

      <div v-if="prikaz === 'treninzi' && vjPodprikaz === 'vjezbe' && vjKorak === 'lista'" class="sadrzaj">
        <div class="tabovi">
          <button v-for="k in vjKategorije" :key="k.kljuc" class="tab" :class="{ 'tab-aktivan': vjFiltarKategorija === k.kljuc }" @click="vjFiltarKategorija = k.kljuc">
            {{ k.naziv }}
          </button>
        </div>
        <div class="tabovi">
          <button v-for="r in vjRazine" :key="r.kljuc" class="tab" :class="{ 'tab-aktivan': vjFiltarRazina === r.kljuc }" @click="vjFiltarRazina = r.kljuc">
            {{ r.naziv }}
          </button>
        </div>

        <div v-if="ucitavanjeVjezbi" class="ucitavanje"><div class="spinner"></div></div>

        <div v-else class="lista-kartica">
          <div v-if="vjezbe.length === 0" class="prazno">Nema vježbi u ovoj kategoriji i razini.</div>
          <div v-for="v in vjezbe" :key="v._id" class="red-izazova">
            <div class="red-info">
              <span class="red-naziv">{{ v.naziv }}</span>
              <span class="red-meta">
                {{ nazivKategorije(v.kategorija) }} · {{ nazivRazine(v.razina) }}
                <template v-if="v.serije">· {{ v.serije }} serije po {{ v.ponavljanja }} ponavljanja<template v-if="v.kilaza"> sa {{ formatirajKilazu(v.kilaza) }}</template></template>
                <template v-if="v.pauza">· odmor {{ v.pauza }}s</template>
              </span>
            </div>
            <div class="red-akcije">
              <button class="gumb-uredi" @click="otvoriFormuVjezbe(v)">Uredi</button>
              <button class="gumb-obrisi" @click="obrisiVjezbu(v)" title="Obriši">✕</button>
            </div>
          </div>

          <button class="gumb-dodaj-novi" @click="otvoriFormuVjezbe()">DODAJ VJEŽBU</button>
        </div>
      </div>

      <div v-if="prikaz === 'treninzi' && vjPodprikaz === 'vjezbe' && vjKorak === 'forma'" class="sadrzaj">
        <button class="gumb-nazad" @click="vjKorak = 'lista'">‹ Nazad</button>
        <div class="forma-kartica">
          <div class="forma-red">
            <label class="forma-label">Naziv vježbe</label>
            <input v-model="vjForma.naziv" class="forma-input" placeholder="npr. Bench Press" />
          </div>

          <div class="forma-red forma-red-dvije">
            <div>
              <label class="forma-label">Kategorija</label>
              <select v-model="vjForma.kategorija" class="forma-input">
                <option value="">Odaberi</option>
                <option v-for="k in vjKategorije" :key="k.kljuc" :value="k.kljuc">{{ k.naziv }}</option>
              </select>
            </div>
            <div>
              <label class="forma-label">Razina</label>
              <select v-model="vjForma.razina" class="forma-input">
                <option value="">Odaberi</option>
                <option v-for="r in vjRazine" :key="r.kljuc" :value="r.kljuc">{{ r.naziv }}</option>
              </select>
            </div>
          </div>

          <div class="forma-red">
            <label class="forma-label">Opis</label>
            <textarea v-model="vjForma.opis" class="forma-textarea" placeholder="Što vježba radi i kako se izvodi (opcionalno)"></textarea>
          </div>

          <div class="forma-red">
            <label class="forma-label">Video (link)</label>
            <input v-model="vjForma.video" class="forma-input" placeholder="https://..." />
          </div>

          <div class="forma-red forma-red-dvije">
            <div>
              <label class="forma-label">Serije</label>
              <input v-model.number="vjForma.serije" type="number" min="0" class="forma-input" placeholder="npr. 4" />
            </div>
            <div>
              <label class="forma-label">Ponavljanja</label>
              <input v-model="vjForma.ponavljanja" class="forma-input" placeholder="npr. 8-12" />
            </div>
          </div>

          <div class="forma-red">
            <label class="forma-label">Kilaža</label>
            <input v-model="vjForma.kilaza" class="forma-input" placeholder="npr. 50-60kg ili tjelesna težina" />
          </div>

          <div class="forma-red">
            <label class="forma-label">Pauza između serija (sekunde)</label>
            <input v-model.number="vjForma.pauza" type="number" min="0" class="forma-input" placeholder="npr. 90" />
          </div>

          <div v-if="vjGreska" class="poruka-greska">{{ vjGreska }}</div>

          <button class="gumb-spremi" @click="spremiVjezbu" :disabled="vjSpremanje">
            {{ vjSpremanje ? 'Spremam...' : (vjUredjujeSeId ? 'SPREMI PROMJENE' : 'DODAJ VJEŽBU') }}
          </button>
        </div>
      </div>

      <div v-if="prikaz === 'treninzi' && vjPodprikaz === 'treninzi' && trKorak === 'lista'" class="sadrzaj">
        <div v-if="ucitavanjeTreninga" class="ucitavanje"><div class="spinner"></div></div>
        <div v-else class="lista-kartica">
          <div v-if="treninzi.length === 0" class="prazno">Još nema treninga.</div>
          <div v-for="t in treninzi" :key="t._id" class="red-izazova">
            <div class="red-info">
              <span class="red-naziv">{{ t.naziv }}</span>
              <span class="red-meta">{{ t.brojVjezbi }} {{ t.brojVjezbi === 1 ? 'vježba' : 'vježbi' }}</span>
            </div>
            <div class="red-akcije">
              <button class="gumb-uredi" @click="otvoriFormuTreninga(t)">Uredi</button>
              <button class="gumb-obrisi" @click="obrisiTrening(t)" title="Obriši">✕</button>
            </div>
          </div>

          <button class="gumb-dodaj-novi" @click="otvoriFormuTreninga()">NOVI TRENING</button>
        </div>
      </div>

      <div v-if="prikaz === 'treninzi' && vjPodprikaz === 'treninzi' && trKorak === 'forma'" class="sadrzaj">
        <button class="gumb-nazad" @click="trKorak = 'lista'">‹ Nazad</button>
        <div class="forma-kartica">
          <div class="forma-red">
            <label class="forma-label">Naziv treninga</label>
            <input v-model="trForma.naziv" class="forma-input" placeholder="npr. Trening za prsa i triceps" />
          </div>
          <div class="forma-red">
            <label class="forma-label">Opis</label>
            <textarea v-model="trForma.opis" class="forma-textarea" placeholder="Kratak opis treninga (opcionalno)"></textarea>
          </div>

          <div class="forma-red">
            <label class="forma-label">Način izvođenja</label>
            <div class="nacin-izbor">
              <button type="button" class="nacin-gumb" :class="{ 'nacin-aktivan': trForma.nacinIzvodjenja === 'redom' }" @click="trForma.nacinIzvodjenja = 'redom'">
                Redom — sve serije jedne pa sljedeća
              </button>
              <button type="button" class="nacin-gumb" :class="{ 'nacin-aktivan': trForma.nacinIzvodjenja === 'kruzno' }" @click="trForma.nacinIzvodjenja = 'kruzno'">
                Kružno — naizmjenično po jedna serija
              </button>
            </div>
          </div>

          <div class="forma-red">
            <label class="forma-label">Odabrane vježbe ({{ trForma.vjezbe.length }}) — povuci za redoslijed, postavi odmor prije sljedeće vježbe</label>
            <div v-if="trForma.vjezbe.length === 0" class="prazno-manje-tekst">Još nisi dodao nijednu vježbu.</div>
            <div v-else class="odabrane-vjezbe">
              <div
                v-for="(stavka, idx) in trForma.vjezbe"
                :key="stavka.vjezbaId"
                class="odabrana-vjezba-red"
                :class="{ 'odabrana-vjezba-vuce-se': povuceniIndeks === idx }"
                draggable="true"
                @dragstart="pocniPovlacenje(idx)"
                @dragover.prevent
                @dragenter.prevent="pomakniPovlacenjem(idx)"
                @dragend="zavrsiPovlacenje"
              >
                <span class="drzac-za-povlacenje" title="Povuci za promjenu redoslijeda">
                  <svg width="14" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="8" cy="6" r="1.6"/><circle cx="8" cy="12" r="1.6"/><circle cx="8" cy="18" r="1.6"/>
                    <circle cx="16" cy="6" r="1.6"/><circle cx="16" cy="12" r="1.6"/><circle cx="16" cy="18" r="1.6"/>
                  </svg>
                </span>
                <span class="odabrana-vjezba-broj">{{ idx + 1 }}.</span>
                <span class="odabrana-vjezba-naziv">{{ nazivVjezbe(stavka.vjezbaId) }}</span>
                <div class="odabrana-vjezba-pauza">
                  <span class="pauza-input-oznaka">odmor poslije:</span>
                  <input v-model.number="stavka.pauza" type="number" min="0" placeholder="npr. 90" class="pauza-input-malo" />
                  <span class="pauza-input-oznaka">s</span>
                </div>
                <button type="button" class="gumb-ukloni" @click="ukloniVjezbuIzTreninga(idx)">✕</button>
              </div>
            </div>
          </div>

          <div class="forma-red">
            <label class="forma-label">Dodaj vježbu iz kategorije</label>
            <div class="tabovi">
              <button v-for="k in vjKategorije" :key="k.kljuc" class="tab" :class="{ 'tab-aktivan': trFiltarKategorija === k.kljuc }" @click="trFiltarKategorija = k.kljuc">
                {{ k.naziv }}
              </button>
            </div>
            <div class="tabovi">
              <button v-for="r in vjRazine" :key="r.kljuc" class="tab" :class="{ 'tab-aktivan': trFiltarRazina === r.kljuc }" @click="trFiltarRazina = r.kljuc">
                {{ r.naziv }}
              </button>
            </div>
            <div v-if="vjezbeZaDodavanje.length === 0" class="prazno-manje-tekst">Nema vježbi u ovoj kategoriji i razini.</div>
            <div v-else class="pool-vjezbe">
              <div v-for="v in vjezbeZaDodavanje" :key="v._id" class="pool-vjezba-red">
                <span class="pool-vjezba-info">
                  <span class="pool-vjezba-naziv">{{ v.naziv }}</span>
                  <span v-if="v.serije" class="pool-vjezba-detalji">
                    {{ v.serije }} serije po {{ v.ponavljanja }} ponavljanja<template v-if="v.kilaza"> sa {{ formatirajKilazu(v.kilaza) }}</template><template v-if="v.pauza"> · odmor {{ v.pauza }}s</template>
                  </span>
                </span>
                <button type="button" class="gumb-dodaj-malo" :disabled="jeVjezbaDodana(v._id)" @click="dodajVjezbuUTrening(v)">
                  {{ jeVjezbaDodana(v._id) ? 'Dodano' : '+ Dodaj' }}
                </button>
              </div>
            </div>
          </div>

          <div v-if="trGreska" class="poruka-greska">{{ trGreska }}</div>

          <button class="gumb-spremi" @click="spremiTrening" :disabled="trSpremanje">
            {{ trSpremanje ? 'Spremam...' : (trUredjujeSeId ? 'SPREMI PROMJENE' : 'SPREMI TRENING') }}
          </button>
        </div>
      </div>

      <div v-if="prikaz === 'recepti' && receptKorak === 'lista'" class="sadrzaj">
        <div v-if="ucitavanjeRecepata" class="ucitavanje"><div class="spinner"></div></div>

        <div v-else class="lista-kartica">
          <div v-if="recepti.length === 0" class="prazno">Nema dodanih recepata.</div>
          <div v-for="r in recepti" :key="r._id" class="red-izazova">
            <div class="red-info">
              <span class="red-naziv">{{ r.naziv }}</span>
              <span class="red-meta">
                <template v-if="r.porcije">{{ r.porcije }} · </template>
                <template v-if="r.kalorije">{{ r.kalorije }} kcal</template>
              </span>
            </div>
            <div class="red-akcije">
              <button class="gumb-uredi" @click="otvoriFormuRecepta(r)">Uredi</button>
              <button class="gumb-obrisi" @click="obrisiRecept(r)" title="Obriši">✕</button>
            </div>
          </div>

          <button class="gumb-dodaj-novi" @click="otvoriFormuRecepta()">DODAJ RECEPT</button>
        </div>
      </div>

      <div v-if="prikaz === 'recepti' && receptKorak === 'forma'" class="sadrzaj">
        <button class="gumb-nazad" @click="receptKorak = 'lista'">‹ Nazad</button>
        <div class="forma-kartica">
          <div class="forma-red">
            <label class="forma-label">Naziv recepta</label>
            <input v-model="receptForma.naziv" class="forma-input" placeholder="npr. Proteinski mafin" />
          </div>

          <div class="forma-red">
            <label class="forma-label">Slika</label>
            <div class="upload-slika-wrap" @click="$refs.receptSlikaInput.click()">
              <img v-if="receptForma.slika" :src="receptForma.slika" class="upload-slika-pregled" />
              <div v-else class="upload-slika-prazno">+ Dodaj sliku</div>
              <div v-if="uploadSlikeUTijeku" class="upload-slika-ucitavanje">Uploadam...</div>
            </div>
            <input ref="receptSlikaInput" type="file" accept="image/*" class="upload-slika-input-skriveno" @change="uploadSlikuRecepta" />
          </div>

          <div class="forma-red">
            <label class="forma-label">Porcije</label>
            <input v-model="receptForma.porcije" class="forma-input" placeholder="npr. 6 komada" />
          </div>

          <div class="forma-red">
            <label class="forma-label">Sastojci (jedan po redu)</label>
            <textarea v-model="receptForma.sastojci" class="forma-textarea" placeholder="2 jaja&#10;1 zrela banana&#10;100 g grčkog jogurta"></textarea>
          </div>

          <div class="forma-red">
            <label class="forma-label">Priprema (jedan korak po redu)</label>
            <textarea v-model="receptForma.priprema" class="forma-textarea" placeholder="Ubaci sve sastojke u blender...&#10;Sipaj smjesu u kalupe...&#10;Peci 15-20 minuta na 180°C"></textarea>
          </div>

          <div class="forma-red forma-red-dvije">
            <div>
              <label class="forma-label">Kalorije</label>
              <input v-model="receptForma.kalorije" class="forma-input" placeholder="npr. ~120 kcal" />
            </div>
            <div>
              <label class="forma-label">Proteini</label>
              <input v-model="receptForma.proteini" class="forma-input" placeholder="npr. ~10-12 g" />
            </div>
          </div>

          <div class="forma-red forma-red-dvije">
            <div>
              <label class="forma-label">Ugljikohidrati</label>
              <input v-model="receptForma.ugljikohidrati" class="forma-input" placeholder="npr. ~8-10 g" />
            </div>
            <div>
              <label class="forma-label">Masti</label>
              <input v-model="receptForma.masti" class="forma-input" placeholder="npr. ~4 g" />
            </div>
          </div>

          <div v-if="receptGreska" class="poruka-greska">{{ receptGreska }}</div>

          <button class="gumb-spremi" @click="spremiRecept" :disabled="receptSpremanje">
            {{ receptSpremanje ? 'Spremam...' : (receptUredjujeSeId ? 'SPREMI PROMJENE' : 'DODAJ RECEPT') }}
          </button>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import api from '../services/api.js';
import { formatirajDatum } from '../utils/aktivnosti.js';
import OdjavaKrug from '../components/OdjavaKrug.vue';
import { potvrdi } from '../composables/potvrda.js';

const TIPOVI = [
  { tip: 'Run', naziv: 'Trčanje' },
  { tip: 'Ride', naziv: 'Biciklizam' },
  { tip: 'Walk', naziv: 'Hodanje' },
  { tip: 'Swim', naziv: 'Plivanje' },
  { tip: 'Workout', naziv: 'Trening snage' },
];

function praznaPravilo() {
  return { mjera: 'km', cilj: null, bodovi: null };
}

function praznaUvjetiForma() {
  const obj = {};
  TIPOVI.forEach(t => {
    obj[t.tip] = { odabran: false, pravila: [praznaPravilo()] };
  });
  return obj;
}

function dodajPravilo(tip) {
  uvjetiForma[tip].pravila.push(praznaPravilo());
}

function ukloniPravilo(tip, idx) {
  uvjetiForma[tip].pravila.splice(idx, 1);
}

function opisPravila(pravilo) {
  const jed = jedinicaTeksta(pravilo.mjera);
  if (!pravilo.cilj || !pravilo.bodovi) return 'Unesi koliko jedinica donosi koliko bodova.';
  return `Svakih ${pravilo.cilj} ${jed} donosi ${pravilo.bodovi} bodova — ponavlja se (npr. ${pravilo.cilj * 2} ${jed} = ${pravilo.bodovi * 2} bodova). Manje od ${pravilo.cilj} ${jed} = 0 bodova za ovo pravilo.`;
}

const mobilniMeni = ref(false);
const prikaz = ref('dashboard');
const korak = ref('lista');
const tab = ref('aktivni');
const ucitavanje = ref(false);
const spremanje = ref(false);
const greska = ref('');

const trenutnoUTeretani = ref([]);
const ucitavanjeTeretana = ref(false);
const feedback = ref([]);
const ucitavanjeFeedback = ref(false);
const obavijesti = ref([]);
const novaObavijest = ref('');
const spremanjeObavijesti = ref(false);
const izazoviUcitani = ref(false);

const naslovi = { dashboard: 'Dashboard', izazovi: 'Izazovi', treninzi: 'Treninzi', recepti: 'Recepti' };

function odaberiPrikaz(novi) {
  prikaz.value = novi;
  if (novi === 'izazovi' && !izazoviUcitani.value) ucitajIzazove();
  if (novi === 'treninzi' && !vjOpcijeUcitane.value) ucitajVjOpcijeIVjezbe();
  if (novi === 'recepti' && !receptiUcitani.value) ucitajRecepte();
}

function formatirajVrijemeUlaska(datum) {
  return new Date(datum).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
}

async function ucitajTrenutnoUTeretani() {
  ucitavanjeTeretana.value = true;
  try {
    const { data } = await api.get('/clanarina/trenutno-u-teretani');
    trenutnoUTeretani.value = data.lista || [];
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanjeTeretana.value = false;
  }
}

async function ucitajFeedback() {
  ucitavanjeFeedback.value = true;
  try {
    const { data } = await api.get('/feedback');
    feedback.value = data.feedback || [];
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanjeFeedback.value = false;
  }
}

async function oznaciProcitano(f) {
  try {
    await api.put(`/feedback/${f._id}/procitano`);
    f.procitano = true;
  } catch (err) {
    console.error(err);
  }
}

async function obrisiFeedback(f) {
  if (!(await potvrdi('Obrisati ovaj feedback?'))) return;
  try {
    await api.delete(`/feedback/${f._id}`);
    feedback.value = feedback.value.filter(x => x._id !== f._id);
  } catch (err) {
    console.error(err);
  }
}

async function ucitajObavijesti() {
  try {
    const { data } = await api.get('/obavijesti');
    obavijesti.value = data.obavijesti || [];
  } catch (err) {
    console.error(err);
  }
}

async function dodajObavijest() {
  if (!novaObavijest.value.trim()) return;
  spremanjeObavijesti.value = true;
  try {
    await api.post('/obavijesti', { tekst: novaObavijest.value });
    novaObavijest.value = '';
    await ucitajObavijesti();
  } catch (err) {
    console.error(err);
  } finally {
    spremanjeObavijesti.value = false;
  }
}

async function obrisiObavijestAdmin(o) {
  if (!(await potvrdi('Obrisati ovu obavijest?'))) return;
  try {
    await api.delete(`/obavijesti/${o._id}`);
    obavijesti.value = obavijesti.value.filter(x => x._id !== o._id);
  } catch (err) {
    console.error(err);
  }
}

const aktivniIzazovi = ref([]);
const prosliIzazovi = ref([]);
const uredjujeSeId = ref(null);

const forma = reactive({ naziv: '', opis: '', vrsta: 'solo', nacin: 'kumulativno', pocetak: '', kraj: '' });
const uvjetiForma = reactive(praznaUvjetiForma());
const velicinaTimaMod = ref('par');

const prikazaniIzazovi = computed(() => tab.value === 'aktivni' ? aktivniIzazovi.value : prosliIzazovi.value);

function jedinicaTeksta(mjera) {
  return { km: 'km', vrijeme: 'minuta', kalorije: 'kalorija', elevacija: 'm visinske razlike', broj: 'aktivnosti' }[mjera] || '';
}

async function ucitajIzazove() {
  ucitavanje.value = true;
  try {
    const { data } = await api.get('/izazovi');
    aktivniIzazovi.value = data.aktivni || [];
    prosliIzazovi.value = data.prosli || [];
    izazoviUcitani.value = true;
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanje.value = false;
  }
}

function odaberiVrstu(vrsta) {
  Object.assign(forma, { naziv: '', opis: '', vrsta, nacin: 'kumulativno', pocetak: '', kraj: '' });
  Object.assign(uvjetiForma, praznaUvjetiForma());
  velicinaTimaMod.value = 'par';
  uredjujeSeId.value = null;
  greska.value = '';
  korak.value = 'forma';
}

function otvoriUredjivanje(izazov) {
  uredjujeSeId.value = izazov._id;
  Object.assign(forma, {
    naziv: izazov.naziv,
    opis: izazov.opis || '',
    vrsta: izazov.vrsta,
    nacin: izazov.nacin || 'kumulativno',
    pocetak: izazov.pocetak?.slice(0, 10),
    kraj: izazov.kraj?.slice(0, 10),
  });
  velicinaTimaMod.value = izazov.velicinaTima === 2 ? 'par' : 'neograniceno';
  Object.assign(uvjetiForma, praznaUvjetiForma());
  (izazov.uvjeti || []).forEach(u => {
    if (!uvjetiForma[u.tip]) return;
    uvjetiForma[u.tip].odabran = true;
    if (uvjetiForma[u.tip].pravila.length === 1 && !uvjetiForma[u.tip].pravila[0].cilj) {
      uvjetiForma[u.tip].pravila = [];
    }
    uvjetiForma[u.tip].pravila.push({ mjera: u.mjera, cilj: u.cilj, bodovi: u.bodovi });
  });
  greska.value = '';
  korak.value = 'forma';
}

async function spremiIzazov() {
  greska.value = '';

  const odabraniTipovi = TIPOVI.filter(t => uvjetiForma[t.tip].odabran);

  const uvjeti = odabraniTipovi.flatMap(t =>
    uvjetiForma[t.tip].pravila
      .filter(p => p.cilj != null && p.cilj !== '' && p.bodovi != null && p.bodovi !== '')
      .map(p => ({ tip: t.tip, mjera: p.mjera, cilj: p.cilj, bodovi: p.bodovi }))
  );

  if (!forma.naziv.trim()) return (greska.value = 'Naziv je obavezan.');
  if (!forma.pocetak || !forma.kraj) return (greska.value = 'Odaberi početak i kraj izazova.');
  if (odabraniTipovi.length === 0) return (greska.value = 'Odaberi barem jednu aktivnost.');
  if (odabraniTipovi.some(t => !uvjeti.some(u => u.tip === t.tip))) {
    return (greska.value = 'Popuni barem jedno pravilo (cilj i bodove) za sve odabrane aktivnosti.');
  }

  spremanje.value = true;
  try {
    const payload = {
      ...forma,
      uvjeti,
      velicinaTima: forma.vrsta === 'tim' ? (velicinaTimaMod.value === 'par' ? 2 : null) : null,
    };
    if (uredjujeSeId.value) {
      await api.put(`/izazovi/${uredjujeSeId.value}`, payload);
    } else {
      await api.post('/izazovi', payload);
    }
    await ucitajIzazove();
    korak.value = 'lista';
  } catch (err) {
    greska.value = err.response?.data?.poruka || 'Greška pri spremanju izazova.';
  } finally {
    spremanje.value = false;
  }
}

async function obrisiIzazov(izazov) {
  if (!(await potvrdi(`Sigurno želiš obrisati izazov "${izazov.naziv}"? Ovo se ne može poništiti.`))) return;
  try {
    await api.delete(`/izazovi/${izazov._id}`);
    await ucitajIzazove();
  } catch (err) {
    console.error(err);
  }
}

const vjKorak = ref('lista');
const vjKategorije = ref([]);
const vjRazine = ref([]);
const vjOpcijeUcitane = ref(false);
const vjFiltarKategorija = ref('');
const vjFiltarRazina = ref('');
const vjezbe = ref([]);
const ucitavanjeVjezbi = ref(false);
const vjUredjujeSeId = ref(null);
const vjGreska = ref('');
const vjSpremanje = ref(false);

function praznaVjForma() {
  return { naziv: '', kategorija: '', razina: '', opis: '', video: '', serije: null, ponavljanja: '', kilaza: '', pauza: null };
}
const vjForma = ref(praznaVjForma());

function nazivKategorije(kljuc) {
  return vjKategorije.value.find(k => k.kljuc === kljuc)?.naziv || kljuc;
}

function nazivRazine(kljuc) {
  return vjRazine.value.find(r => r.kljuc === kljuc)?.naziv || kljuc;
}

function formatirajKilazu(kilaza) {
  if (!kilaza) return '';
  return /^[\d.,\-\s]+$/.test(kilaza) ? `${kilaza} kg` : kilaza;
}

async function ucitajVjOpcijeIVjezbe() {
  try {
    const { data } = await api.get('/vjezbe/opcije');
    vjKategorije.value = data.kategorije || [];
    vjRazine.value = data.razine || [];
    vjFiltarKategorija.value = vjKategorije.value[0]?.kljuc || '';
    vjFiltarRazina.value = vjRazine.value[0]?.kljuc || '';
    vjOpcijeUcitane.value = true;
  } catch (err) {
    console.error(err);
  }
  await ucitajVjezbe();
}

async function ucitajVjezbe() {
  ucitavanjeVjezbi.value = true;
  try {
    const { data } = await api.get(`/vjezbe?kategorija=${vjFiltarKategorija.value}&razina=${vjFiltarRazina.value}`);
    vjezbe.value = data.vjezbe || [];
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanjeVjezbi.value = false;
  }
}

watch([vjFiltarKategorija, vjFiltarRazina], () => {
  if (vjOpcijeUcitane.value) ucitajVjezbe();
});

function otvoriFormuVjezbe(v) {
  vjGreska.value = '';
  if (v) {
    vjUredjujeSeId.value = v._id;
    vjForma.value = {
      naziv: v.naziv,
      kategorija: v.kategorija,
      razina: v.razina,
      opis: v.opis || '',
      video: v.video || '',
      serije: v.serije || null,
      ponavljanja: v.ponavljanja || '',
      kilaza: v.kilaza || '',
      pauza: v.pauza || null,
    };
  } else {
    vjUredjujeSeId.value = null;
    vjForma.value = praznaVjForma();
    vjForma.value.kategorija = vjFiltarKategorija.value;
    vjForma.value.razina = vjFiltarRazina.value;
  }
  vjKorak.value = 'forma';
}

async function spremiVjezbu() {
  vjGreska.value = '';
  if (!vjForma.value.naziv.trim()) return (vjGreska.value = 'Naziv je obavezan.');
  if (!vjForma.value.kategorija) return (vjGreska.value = 'Odaberi kategoriju.');
  if (!vjForma.value.razina) return (vjGreska.value = 'Odaberi razinu.');

  vjSpremanje.value = true;
  try {
    if (vjUredjujeSeId.value) {
      await api.put(`/vjezbe/${vjUredjujeSeId.value}`, vjForma.value);
    } else {
      await api.post('/vjezbe', vjForma.value);
    }
    vjKorak.value = 'lista';
    await ucitajVjezbe();
  } catch (err) {
    vjGreska.value = err.response?.data?.poruka || 'Greška pri spremanju vježbe.';
  } finally {
    vjSpremanje.value = false;
  }
}

async function obrisiVjezbu(v) {
  if (!(await potvrdi(`Sigurno obrisati vježbu "${v.naziv}"?`))) return;
  try {
    await api.delete(`/vjezbe/${v._id}`);
    await ucitajVjezbe();
  } catch (err) {
    console.error(err);
  }
}

const vjPodprikaz = ref('vjezbe');
const trKorak = ref('lista');
const treninzi = ref([]);
const ucitavanjeTreninga = ref(false);
const sveVjezbe = ref([]);
const trFiltarKategorija = ref('');
const trFiltarRazina = ref('');
const trUredjujeSeId = ref(null);
const trGreska = ref('');
const trSpremanje = ref(false);

function praznaTrForma() {
  return { naziv: '', opis: '', vjezbe: [], nacinIzvodjenja: 'redom' };
}
const trForma = ref(praznaTrForma());

const vjezbeZaDodavanje = computed(() =>
  sveVjezbe.value.filter(v => v.kategorija === trFiltarKategorija.value && v.razina === trFiltarRazina.value)
);

function nazivVjezbe(id) {
  return sveVjezbe.value.find(v => v._id === id)?.naziv || '…';
}

async function odaberiPodprikazTreninzi() {
  vjPodprikaz.value = 'treninzi';
  if (!vjOpcijeUcitane.value) await ucitajVjOpcijeIVjezbe();
  trFiltarKategorija.value = vjKategorije.value[0]?.kljuc || '';
  trFiltarRazina.value = vjRazine.value[0]?.kljuc || '';
  await ucitajSveVjezbe();
  await ucitajTreninge();
}

async function ucitajSveVjezbe() {
  try {
    const { data } = await api.get('/vjezbe');
    sveVjezbe.value = data.vjezbe || [];
  } catch (err) {
    console.error(err);
  }
}

async function ucitajTreninge() {
  ucitavanjeTreninga.value = true;
  try {
    const { data } = await api.get('/treninzi');
    treninzi.value = data.treninzi || [];
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanjeTreninga.value = false;
  }
}

function jeVjezbaDodana(id) {
  return trForma.value.vjezbe.some(s => s.vjezbaId === id);
}

function dodajVjezbuUTrening(v) {
  if (!jeVjezbaDodana(v._id)) trForma.value.vjezbe.push({ vjezbaId: v._id, pauza: null });
}

function ukloniVjezbuIzTreninga(idx) {
  trForma.value.vjezbe.splice(idx, 1);
}

const povuceniIndeks = ref(null);

function pocniPovlacenje(idx) {
  povuceniIndeks.value = idx;
}

function pomakniPovlacenjem(idx) {
  if (povuceniIndeks.value === null || povuceniIndeks.value === idx) return;
  const niz = trForma.value.vjezbe;
  const [stavka] = niz.splice(povuceniIndeks.value, 1);
  niz.splice(idx, 0, stavka);
  povuceniIndeks.value = idx;
}

function zavrsiPovlacenje() {
  povuceniIndeks.value = null;
}

async function otvoriFormuTreninga(t) {
  trGreska.value = '';
  if (t) {
    trUredjujeSeId.value = t._id;
    try {
      const { data } = await api.get(`/treninzi/${t._id}`);
      trForma.value = {
        naziv: data.trening.naziv,
        opis: data.trening.opis || '',
        vjezbe: data.trening.vjezbe.map(v => ({ vjezbaId: v._id, pauza: v.pauzaNakon ?? null })),
        nacinIzvodjenja: data.trening.nacinIzvodjenja || 'redom',
      };
    } catch (err) {
      console.error(err);
      trForma.value = { naziv: t.naziv, opis: t.opis || '', vjezbe: [] };
    }
  } else {
    trUredjujeSeId.value = null;
    trForma.value = praznaTrForma();
  }
  trKorak.value = 'forma';
}

async function spremiTrening() {
  trGreska.value = '';
  if (!trForma.value.naziv.trim()) return (trGreska.value = 'Naziv je obavezan.');
  if (trForma.value.vjezbe.length === 0) return (trGreska.value = 'Dodaj barem jednu vježbu.');

  trSpremanje.value = true;
  try {
    if (trUredjujeSeId.value) {
      await api.put(`/treninzi/${trUredjujeSeId.value}`, trForma.value);
    } else {
      await api.post('/treninzi', trForma.value);
    }
    trKorak.value = 'lista';
    await ucitajTreninge();
  } catch (err) {
    trGreska.value = err.response?.data?.poruka || 'Greška pri spremanju treninga.';
  } finally {
    trSpremanje.value = false;
  }
}

async function obrisiTrening(t) {
  if (!(await potvrdi(`Sigurno obrisati trening "${t.naziv}"?`))) return;
  try {
    await api.delete(`/treninzi/${t._id}`);
    await ucitajTreninge();
  } catch (err) {
    console.error(err);
  }
}

const receptKorak = ref('lista');
const recepti = ref([]);
const receptiUcitani = ref(false);
const ucitavanjeRecepata = ref(false);
const receptUredjujeSeId = ref(null);
const receptGreska = ref('');
const receptSpremanje = ref(false);

function praznaReceptForma() {
  return { naziv: '', slika: '', porcije: '', sastojci: '', priprema: '', kalorije: '', proteini: '', ugljikohidrati: '', masti: '' };
}
const receptForma = ref(praznaReceptForma());
const uploadSlikeUTijeku = ref(false);

async function uploadSlikuRecepta(event) {
  const datoteka = event.target.files[0];
  if (!datoteka) return;

  const formData = new FormData();
  formData.append('slika', datoteka);

  uploadSlikeUTijeku.value = true;
  receptGreska.value = '';
  try {
    const { data } = await api.post('/recepti/slika', formData);
    receptForma.value.slika = data.slika;
  } catch (err) {
    receptGreska.value = err.response?.data?.poruka || 'Greška pri uploadu slike.';
  } finally {
    uploadSlikeUTijeku.value = false;
    event.target.value = '';
  }
}

async function ucitajRecepte() {
  ucitavanjeRecepata.value = true;
  try {
    const { data } = await api.get('/recepti');
    recepti.value = data.recepti || [];
    receptiUcitani.value = true;
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanjeRecepata.value = false;
  }
}

function otvoriFormuRecepta(r) {
  if (r) {
    receptUredjujeSeId.value = r._id;
    receptForma.value = {
      naziv: r.naziv,
      slika: r.slika || '',
      porcije: r.porcije || '',
      sastojci: r.sastojci,
      priprema: r.priprema,
      kalorije: r.kalorije || '',
      proteini: r.proteini || '',
      ugljikohidrati: r.ugljikohidrati || '',
      masti: r.masti || '',
    };
  } else {
    receptUredjujeSeId.value = null;
    receptForma.value = praznaReceptForma();
  }
  receptGreska.value = '';
  receptKorak.value = 'forma';
}

async function spremiRecept() {
  receptGreska.value = '';

  if (!receptForma.value.naziv.trim()) return (receptGreska.value = 'Naziv je obavezan.');
  if (!receptForma.value.sastojci.trim()) return (receptGreska.value = 'Sastojci su obavezni.');
  if (!receptForma.value.priprema.trim()) return (receptGreska.value = 'Priprema je obavezna.');

  receptSpremanje.value = true;
  try {
    if (receptUredjujeSeId.value) {
      await api.put(`/recepti/${receptUredjujeSeId.value}`, receptForma.value);
    } else {
      await api.post('/recepti', receptForma.value);
    }
    await ucitajRecepte();
    receptKorak.value = 'lista';
  } catch (err) {
    receptGreska.value = err.response?.data?.poruka || 'Greška pri spremanju recepta.';
  } finally {
    receptSpremanje.value = false;
  }
}

async function obrisiRecept(r) {
  if (!(await potvrdi(`Sigurno želiš obrisati recept "${r.naziv}"? Ovo se ne može poništiti.`))) return;
  try {
    await api.delete(`/recepti/${r._id}`);
    await ucitajRecepte();
  } catch (err) {
    console.error(err);
  }
}

onMounted(() => {
  ucitajTrenutnoUTeretani();
  ucitajFeedback();
  ucitajObavijesti();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap');

* { box-sizing: border-box; }

.dashboard {
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  background: #1a1a1a;
  font-family: 'Barlow', sans-serif;
  color: #fff;
  font-size: 16px;
}

.sidebar {
  width: 240px;
  background: #f5c800;
  display: flex;
  flex-direction: column;
  padding: 1.75rem 0;
  flex-shrink: 0;
  z-index: 100;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1.5rem 1.75rem;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  margin-bottom: 1.25rem;
}

.logo-img { width: 85px; height: 85px; object-fit: contain; }

.sidebar-nav {
  flex: 1;
  padding: 0 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.9rem 1.1rem;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #1a1a1a;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
  text-align: left;
}

.nav-item.active, .nav-item:hover { background: rgba(0,0,0,0.1); }

.sidebar-korisnik {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1.1rem 1.35rem;
  border-top: 1px solid rgba(0,0,0,0.1);
}

.korisnik-inicijali {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #1a1a1a;
  color: #f5c800;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  font-size: 1rem;
  flex-shrink: 0;
}

.korisnik-info { display: flex; flex-direction: column; gap: 0.2rem; overflow: hidden; }
.korisnik-ime {
  color: #1a1a1a;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.gumb-odjava { background: none; border: none; color: rgba(0,0,0,0.5); font-size: 0.8rem; cursor: pointer; padding: 0; font-family: 'Barlow', sans-serif; }
.gumb-odjava:hover { color: #1a1a1a; }

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 0.25rem; }
.hamburger span { display: block; width: 24px; height: 2px; background: #fff; border-radius: 2px; }

.header-naslov {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.7rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.05em;
  margin: 0;
}

.glavni { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
.sadrzaj { padding: 1.5rem 2rem 2rem; max-width: 800px; width: 100%; margin: 0 auto; }

.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 90; display: none; }

.ucitavanje { display: flex; justify-content: center; padding: 4rem; }
.spinner {
  width: 36px; height: 36px;
  border: 3px solid rgba(245,200,0,0.2);
  border-top-color: #f5c800;
  border-radius: 50%;
  animation: rotacija 0.8s linear infinite;
}
@keyframes rotacija { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.tabovi { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
.tab {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.5);
  padding: 0.6rem 1.25rem;
  border-radius: 20px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-aktivan { background: #f5c800; border-color: #f5c800; color: #1a1a1a; }

.podprikaz-tabovi {
  display: flex;
  gap: 0.5rem;
  padding: 1.5rem 2rem 0;
  max-width: 780px;
  margin: 0 auto;
  width: 100%;
}

.podprikaz-tab {
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: rgba(255,255,255,0.4);
  padding: 0.5rem 0.25rem;
  margin-right: 1.25rem;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  cursor: pointer;
}
.podprikaz-tab-aktivan { color: #f5c800; border-bottom-color: #f5c800; }

.prazno-manje-tekst { color: rgba(255,255,255,0.3); font-size: 0.85rem; padding: 0.5rem 0; }

.odabrane-vjezbe {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  background: #1e1e1e;
  border-radius: 10px;
  padding: 0.75rem;
}

.odabrana-vjezba-red {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.3rem;
  border-radius: 8px;
  transition: background 0.15s, opacity 0.15s;
}
.odabrana-vjezba-red:hover { background: rgba(255,255,255,0.03); }
.odabrana-vjezba-vuce-se { opacity: 0.4; }

.drzac-za-povlacenje {
  color: rgba(255,255,255,0.3);
  cursor: grab;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}
.drzac-za-povlacenje:active { cursor: grabbing; }

.odabrana-vjezba-pauza {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
}

.pauza-input-malo {
  width: 60px;
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  color: #fff;
  padding: 0.3rem 0.4rem;
  font-family: 'Barlow', sans-serif;
  font-size: 0.82rem;
  text-align: right;
}
.pauza-input-malo:focus { outline: none; border-color: #f5c800; }

.pauza-input-oznaka { color: rgba(255,255,255,0.4); font-size: 0.78rem; }

.odabrana-vjezba-broj { color: rgba(255,255,255,0.35); font-size: 0.85rem; width: 1.5rem; flex-shrink: 0; }
.odabrana-vjezba-naziv { flex: 1; font-size: 0.9rem; color: #fff; }

.gumb-strelica {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.6);
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  flex-shrink: 0;
}
.gumb-strelica:hover:not(:disabled) { border-color: #f5c800; color: #f5c800; }
.gumb-strelica:disabled { opacity: 0.3; cursor: not-allowed; }

.gumb-ukloni {
  background: rgba(239,68,68,0.12);
  border: 1px solid rgba(239,68,68,0.3);
  color: #fca5a5;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  flex-shrink: 0;
}
.gumb-ukloni:hover { background: rgba(239,68,68,0.22); }

.pool-vjezbe {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  max-height: 220px;
  overflow-y: auto;
}

.pool-vjezba-red {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  background: #1e1e1e;
  border-radius: 8px;
  padding: 0.6rem 0.85rem;
  font-size: 0.9rem;
}

.pool-vjezba-info { display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }
.pool-vjezba-naziv { font-size: 0.9rem; }
.pool-vjezba-detalji { font-size: 0.75rem; color: #f5c800; }

.gumb-dodaj-malo {
  background: transparent;
  border: 1px solid rgba(245,200,0,0.35);
  color: #f5c800;
  padding: 0.35rem 0.85rem;
  border-radius: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
}
.gumb-dodaj-malo:hover:not(:disabled) { background: rgba(245,200,0,0.1); }
.gumb-dodaj-malo:disabled { opacity: 0.5; cursor: not-allowed; }

.lista-kartica {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 0.5rem 1.5rem;
}

.prazno { padding: 2.5rem; text-align: center; color: rgba(255,255,255,0.25); font-size: 0.95rem; }

.sekcija-naslov {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #fff;
  margin: 0 0 1rem;
}
.sekcija-naslov:not(:first-child) { margin-top: 2.25rem; }

.lista-kartica-margin { margin-bottom: 0.5rem; }

.red-teretana {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 0.92rem;
}
.red-teretana:last-child { border-bottom: none; }
.red-teretana-vrijeme { color: rgba(255,255,255,0.4); font-size: 0.82rem; }

.red-feedback {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.red-feedback:last-child { border-bottom: none; }
.red-feedback-neprocitano { border-left: 3px solid #f5c800; padding-left: 0.85rem; margin-left: -0.85rem; }

.feedback-info { display: flex; flex-direction: column; gap: 0.35rem; min-width: 0; }
.feedback-glavno { display: flex; align-items: baseline; gap: 0.75rem; flex-wrap: wrap; }
.feedback-ime { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 0.98rem; }
.feedback-datum { font-size: 0.78rem; color: rgba(255,255,255,0.4); }
.feedback-tekst { font-size: 0.88rem; color: rgba(255,255,255,0.75); margin: 0; line-height: 1.4; }

.feedback-akcije { display: flex; gap: 0.5rem; flex-shrink: 0; align-items: center; }

.gumb-oznaci {
  background: rgba(74,222,128,0.12);
  border: 1px solid rgba(74,222,128,0.3);
  color: #4ade80;
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.gumb-oznaci:hover { background: rgba(74,222,128,0.22); }

.forma-obavijest {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1rem;
}
.forma-obavijest input {
  flex: 1;
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #fff;
  padding: 0.65rem 0.9rem;
  font-family: 'Barlow', sans-serif;
  font-size: 0.9rem;
}
.forma-obavijest input:focus { outline: none; border-color: #f5c800; }

.gumb-dodaj-obavijest {
  background: #f5c800;
  border: none;
  color: #1a1a1a;
  padding: 0.65rem 1.3rem;
  border-radius: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.gumb-dodaj-obavijest:disabled { opacity: 0.5; cursor: not-allowed; }

.red-obavijest {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.red-obavijest:last-child { border-bottom: none; }
.obavijest-info p { margin: 0 0 0.3rem; font-size: 0.9rem; }
.obavijest-info span { font-size: 0.78rem; color: rgba(255,255,255,0.4); }

.red-izazova {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  transition: opacity 0.2s, filter 0.2s;
}
.red-izazova:last-of-type { border-bottom: none; }

.red-prosli { opacity: 0.5; filter: grayscale(1); }

.red-info { display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }
.red-naziv {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.03em;
}
.red-meta { font-size: 0.82rem; color: rgba(255,255,255,0.4); }

.lampica-aktivna {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 6px rgba(74,222,128,0.7);
  flex-shrink: 0;
}

.red-akcije { display: flex; gap: 0.5rem; flex-shrink: 0; }

.gumb-obrisi {
  background: rgba(239,68,68,0.12);
  border: 1px solid rgba(239,68,68,0.3);
  color: #fca5a5;
  width: 38px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}
.gumb-obrisi:hover { background: rgba(239,68,68,0.22); }

.gumb-uredi {
  background: rgba(245,200,0,0.12);
  border: 1px solid rgba(245,200,0,0.3);
  color: #f5c800;
  padding: 0.5rem 1.1rem;
  border-radius: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}
.gumb-uredi:hover { background: rgba(245,200,0,0.22); }

.gumb-dodaj-novi {
  display: block;
  width: 100%;
  margin: 1.25rem 0;
  background: #f5c800;
  border: none;
  color: #1a1a1a;
  padding: 0.9rem;
  border-radius: 10px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: background 0.2s;
}
.gumb-dodaj-novi:hover { background: #ffd700; }

.gumb-nazad {
  background: none;
  border: none;
  color: rgba(255,255,255,0.5);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;
  margin-bottom: 1.25rem;
  font-family: 'Barlow', sans-serif;
}
.gumb-nazad:hover { color: #f5c800; }

.tip-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.tip-kartica {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 1.75rem 1.5rem;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.tip-kartica:hover { border-color: #f5c800; background: #2a2a2a; }

.tip-naslov {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.3rem;
  font-weight: 800;
  color: #f5c800;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.tip-opis { font-size: 0.88rem; color: rgba(255,255,255,0.55); line-height: 1.5; margin: 0; }

.forma-kartica {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.forma-red { display: flex; flex-direction: column; gap: 0.5rem; }
.forma-red-dvije { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.forma-label {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.06em;
}

.forma-input, .forma-textarea, .uvjet-polje select, .uvjet-polje input {
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #fff;
  padding: 0.65rem 0.85rem;
  font-family: 'Barlow', sans-serif;
  font-size: 0.92rem;
  width: 100%;
}
.forma-input:focus, .forma-textarea:focus, .uvjet-polje select:focus, .uvjet-polje input:focus {
  outline: none;
  border-color: #f5c800;
}
.forma-textarea { min-height: 70px; resize: vertical; }

.upload-slika-input-skriveno { display: none; }

.upload-slika-wrap {
  position: relative;
  width: 160px;
  height: 160px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background: #1e1e1e;
  border: 1px dashed rgba(255,255,255,0.2);
}

.upload-slika-pregled { width: 100%; height: 100%; object-fit: cover; }

.upload-slika-prazno {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.4);
  font-size: 0.85rem;
  text-align: center;
  padding: 0.5rem;
}

.upload-slika-ucitavanje {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f5c800;
  font-size: 0.8rem;
  font-weight: 600;
}

.vrsta-oznaka {
  display: inline-block;
  background: rgba(245,200,0,0.12);
  color: #f5c800;
  border: 1px solid rgba(245,200,0,0.3);
  padding: 0.45rem 1rem;
  border-radius: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  letter-spacing: 0.05em;
  width: fit-content;
}

.nacin-izbor { display: flex; gap: 0.6rem; flex-wrap: wrap; }

.nacin-gumb {
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.6);
  padding: 0.6rem 1.1rem;
  border-radius: 8px;
  font-family: 'Barlow', sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.nacin-gumb:hover { border-color: rgba(245,200,0,0.4); }
.nacin-aktivan { background: rgba(245,200,0,0.12); border-color: #f5c800; color: #f5c800; }

.nacin-opis {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.4);
  margin: 0.6rem 0 0;
  line-height: 1.4;
}

.velicina-izbor { display: flex; gap: 0.6rem; flex-wrap: wrap; }

.velicina-gumb {
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.6);
  padding: 0.6rem 1.1rem;
  border-radius: 8px;
  font-family: 'Barlow', sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.velicina-gumb:hover { border-color: rgba(245,200,0,0.4); }
.velicina-aktivan { background: rgba(245,200,0,0.12); border-color: #f5c800; color: #f5c800; }

.aktivnosti-lista { display: flex; flex-direction: column; gap: 0.5rem; }

.aktivnost-stavka {
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 0.9rem 1rem;
}

.checkbox-red {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
}
.checkbox-red input { width: 16px; height: 16px; accent-color: #f5c800; cursor: pointer; }

.uvjet-sekcija { margin-top: 0.85rem; display: flex; flex-direction: column; gap: 0.9rem; }

.pravilo-blok {
  padding: 0.85rem;
  background: #232323;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px;
}

.uvjet-polja {
  display: grid;
  grid-template-columns: repeat(3, 1fr) auto;
  gap: 0.75rem;
  align-items: end;
}

.uvjet-polje { display: flex; flex-direction: column; gap: 0.3rem; }
.uvjet-polje label { font-size: 0.72rem; color: rgba(255,255,255,0.4); letter-spacing: 0.04em; }

.gumb-ukloni-pravilo {
  background: rgba(239,68,68,0.12);
  border: 1px solid rgba(239,68,68,0.3);
  color: #fca5a5;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  flex-shrink: 0;
}
.gumb-ukloni-pravilo:hover { background: rgba(239,68,68,0.22); }

.gumb-dodaj-pravilo {
  align-self: flex-start;
  background: transparent;
  border: 1px dashed rgba(245,200,0,0.4);
  color: #f5c800;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: background 0.2s;
}
.gumb-dodaj-pravilo:hover { background: rgba(245,200,0,0.1); }

.uvjet-napomena {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.35);
  margin-top: 0.5rem;
  line-height: 1.4;
}

.poruka-greska {
  background: rgba(239,68,68,0.12);
  border: 1px solid rgba(239,68,68,0.3);
  color: #fca5a5;
  padding: 0.65rem 0.9rem;
  border-radius: 8px;
  font-size: 0.85rem;
}

.gumb-spremi {
  background: #f5c800;
  border: none;
  color: #1a1a1a;
  padding: 0.9rem;
  border-radius: 10px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: background 0.2s;
}
.gumb-spremi:hover:not(:disabled) { background: #ffd700; }
.gumb-spremi:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 768px) {
  .sidebar {
    position: fixed; left: 0; top: 0; bottom: 0;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    overflow-y: auto;
  }
  .sidebar-open { transform: translateX(0); }
  .overlay { display: block; }
  .hamburger { display: flex; }
  .header { padding: 1.1rem 1.25rem; }
  .sadrzaj { padding: 1rem 1rem 1.5rem; }
  .tip-grid { grid-template-columns: 1fr; }
  .forma-red-dvije { grid-template-columns: 1fr; }
  .uvjet-polja { grid-template-columns: 1fr 1fr; }
  .gumb-ukloni-pravilo { width: 100%; grid-column: 1 / -1; }
}
</style>
