<template>
    <section>
        <h2 class="section-title">Reglement</h2>
        <div class="rules-grid">
            <!-- Selectie -->
            <div class="rule-card">
                <h4>01</h4>
                <h3>Selectie</h3>
                <p>
                    Elke deelnemer stelt een ploeg samen bestaande uit {{ maxRenners }} vrij gekozen renners.
                </p>
            </div>

            <!-- Favorieten -->
            <div class="rule-card">
                <h4>02</h4>
                <h3>Favorieten</h3>
                <p>
                    Er is een Lijst Der Favorieten om gelijke teams te vermijden.
                    Elke favoriet heeft een waarde van 1, 3 of 6 punten.
                    Maximaal {{ maxPoints }} punten aan favorieten zijn toegestaan.
                </p>
            </div>

            <!-- Dagelijkse puntentelling -->
            <div class="rule-card">
                <h4>03</h4>
                <h3>Punten per etappe</h3>
                <p>Per etappe kunnen er punten worden verdiend voor de uitslag tijdens de etappe en voor de stand in algemeen klassement en de
                    nevenklassementen.</p>
                <details>
                    <summary>Toon volledige puntentabel</summary>
                    <p>Etappe:</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Positie</th>
                                <th>Punten</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>30</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>25</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>20</td>
                            </tr>
                            <tr>
                                <td>...</td>
                                <td>...</td>
                            </tr>
                            <tr>
                                <td>10</td>
                                <td>2</td>
                            </tr>
                        </tbody>
                    </table>

                    <p>Klassement:</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Positie</th>
                                <th>Geel</th>
                                <th>Groen</th>
                                <th>Bol</th>
                                <th>Wit</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>5</td>
                                <td>3</td>
                                <td>3</td>
                                <td>3</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>3</td>
                                <td>2</td>
                                <td>2</td>
                                <td>2</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>2</td>
                                <td>1</td>
                                <td>1</td>
                                <td>1</td>
                            </tr>
                        </tbody>
                    </table>

                </details>
            </div>

            <!-- Eindklassement -->
            <div class="rule-card">
                <h4>04</h4>
                <h3>Eindklassement</h3>
                <p>De top 20 renners in het algemeen eindklassement ontvangen dalende punten van 90 tot 20. Daarnaast verdienen de eerste 5 renners in de nevenklassementen ook nog punten.</p>
                <details>
                    <summary>Toon volledige puntentabel</summary>
                    <p>Alg. eindklassement:</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Positie</th>
                                <th>Punten</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>90</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>80</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>75</td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>70</td>
                            </tr>
                            <tr>
                                <td>5</td>
                                <td>65</td>
                            </tr>
                            <tr>
                                <td>6</td>
                                <td>60</td>
                            </tr>
                            <tr>
                                <td>7</td>
                                <td>55</td>
                            </tr>
                            <tr>
                                <td>8</td>
                                <td>50</td>
                            </tr>
                            <tr>
                                <td>9</td>
                                <td>45</td>
                            </tr>
                            <tr>
                                <td>10</td>
                                <td>40</td>
                            </tr>
                            <tr>
                                <td>11</td>
                                <td>38</td>
                            </tr>
                            <tr>
                                <td>12</td>
                                <td>36</td>
                            </tr>
                            <tr>
                                <td>13</td>
                                <td>34</td>
                            </tr>
                            <tr>
                                <td>14</td>
                                <td>32</td>
                            </tr>
                            <tr>
                                <td>15</td>
                                <td>30</td>
                            </tr>
                            <tr>
                                <td>16</td>
                                <td>28</td>
                            </tr>
                            <tr>
                                <td>17</td>
                                <td>26</td>
                            </tr>
                            <tr>
                                <td>18</td>
                                <td>24</td>
                            </tr>
                            <tr>
                                <td>19</td>
                                <td>22</td>
                            </tr>
                            <tr>
                                <td>20</td>
                                <td>20</td>
                            </tr>
                        </tbody>
                    </table>

                    <p>Klassement:</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Positie</th>
                                <th>Groen, bollen, wit</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>40</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>30</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>20</td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>15</td>
                            </tr>
                            <tr>
                                <td>5</td>
                                <td>10</td>
                            </tr>
                        </tbody>
                    </table>
                </details>

            </div>
        </div>
    </section>
</template>

<script setup>
const props = defineProps({
  maxPoints: Number,
  maxRenners: Number
})
</script>

<style scoped>
.rules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin: 4rem 0 6rem;
}

.rule-card {
    border-top: 1px solid var(--primary);
}

.rule-card h3 {
  font-weight: var(--font-weight-bold);
  font-size: var(--text-xs);
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-spaced);
}

.rule-card h4 {
  font-weight: var(--font-weight-light);
  font-size: var(--text-xs);
  margin-bottom: 0;
}

.rule-card table {
    width: 100%;
    border-collapse: collapse;
}

.rule-card table th,
.rule-card table td {
    border-bottom: 1px solid var(--border);
    text-align: right;
    font-weight: var(--font-weight-medium);
    font-size: var(--text-sm);
    color: var(--muted-foreground);
}

.rule-card table th:nth-child(1),
.rule-card table td:nth-child(1) {
    text-align: left;
}

.rule-card table th {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: var(--tracking-spaced);
}

details {
    margin-top: 0.5rem;
    padding-left: 1rem;
    border-left: 1px solid var(--border);
}

summary {
    color: var(--muted-foreground);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
}
</style>
