# Gestión de Horas V3

Una aplicación web sencilla para el control horario personal, seguimiento de proyectos y gestión de horas extra según reglas específicas.

## Descripción

Esta aplicación permite llevar un registro detallado de las horas trabajadas en diferentes proyectos, visualizar resúmenes, gestionar horas extra con compensaciones específicas y realizar copias de seguridad de los datos. Toda la información se guarda localmente en el navegador del usuario mediante `localStorage`.

## Características Principales

* **Vista de Calendario:** Interfaz visual intuitiva para añadir y ver tareas diarias.
* **Panel Lateral Detallado:** Muestra el resumen del día seleccionado (horas totales, restantes, no imputadas), lista de tareas con opciones para marcar como imputada o borrar, y formulario para añadir nuevas tareas.
* **Gestión de Tipos de Día:** Permite marcar días específicos como laborables (por defecto), vacaciones o festivos.
* **Vista de Resumen:**
    * Genera resúmenes por rango de fechas seleccionable.
    * Desglose de horas por Proyecto y por Jefe de Proyecto (JP).
    * Visualización mediante gráficos de tarta y tablas detalladas.
    * **Exportación a CSV:** Descarga el resumen de tareas del rango seleccionado en formato CSV.
* **Gestión de Horas Extra:**
    * [cite_start]Pestaña dedicada para registrar horas extra especificando la fecha, horas, descripción, el tipo (A [cite: 3, 7, 8, 17][cite_start], B [cite: 4, 9, 10, 11, 18][cite_start], o C [cite: 5, 12, 13, 14, 19][cite_start]) según las reglas definidas, y el modo de canje (dinero o horas libres)[cite: 2].
    * [cite_start]Cálculo automático de la compensación correspondiente (Euros o tiempo libre) basado en el tipo de hora extra[cite: 3, 4, 5, 17, 18, 19]. [cite_start]Se contempla la posibilidad de canje mixto[cite: 20].
    * Resumen visible de los totales pendientes de canjear (dinero y horas libres).
    * Listas separadas para horas pendientes y horas ya canjeadas (historial).
    * Opción para marcar horas como "Canjeadas" o borrarlas.
* **Configuración:**
    * Ajuste del número de horas por defecto para la jornada laboral estándar.
    * **Copia de Seguridad:** Funciones para Exportar (descargar un archivo JSON con todos los datos) e Importar (restaurar datos desde un archivo JSON previamente exportado).
    * **Administración de Sugerencias:** Permite ver, renombrar (actualizando todas las tareas existentes) o borrar las sugerencias de autocompletado para Proyectos y JPs.
* **Modo Oscuro/Claro:** Interruptor para cambiar entre temas visuales.
* **Persistencia de Datos:** Toda la información se guarda localmente en el `localStorage` del navegador.
* **Personalización:** Incluye información de versión y autor en la sección "Acerca de", además de un Easter Egg en la consola del navegador.

## Tecnologías Utilizadas

* HTML5
* CSS3 (con variables para temas claro/oscuro)
* JavaScript (ES6+)
* [Chart.js](https://www.chartjs.org/) (para los gráficos de resumen)
* `localStorage` API (para el almacenamiento de datos en el navegador)

## Cómo Usar

### Localmente

1.  Descarga o clona este repositorio (o descomprime el archivo ZIP si te lo pasaron así).
2.  Asegúrate de tener los archivos `index.html`, `style.css`, `app.js` (y la imagen/GIF del Easter Egg, si aplica) en la misma carpeta.
3.  Abre el archivo `index.html` con tu navegador web preferido (Chrome, Firefox, Edge, etc.).

### Vía GitHub Pages (Si está desplegado)

Simplemente accede a la URL proporcionada:


## Funcionamiento del Almacenamiento

Toda la información que introduces (tareas, horas extra, configuración, tipos de día, sugerencias) se guarda directamente en el `localStorage` de **tu navegador**.

**Importante:** Esto significa que los datos son **locales** a ese navegador y ese ordenador/perfil de usuario.
* Si usas la aplicación en otro navegador (por ejemplo, cambias de Chrome a Firefox), no verás tus datos.
* Si usas la aplicación en otro ordenador, no verás tus datos.
* Si limpias los datos de navegación de tu navegador (incluyendo `localStorage`), **perderás toda la información**.

**Recomendación:** Utiliza la función de **Exportar Backup** en la sección de Configuración regularmente para guardar tus datos en un archivo `.json` seguro en tu disco duro. Podrás restaurarlo usando la opción **Importar Backup**.

## Autor

Programado por **Jonathan Rodriguez**.

---

