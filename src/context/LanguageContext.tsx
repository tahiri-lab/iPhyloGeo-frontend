import { createContext, useContext, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'fr' | 'es'

export interface Translations {
  // Nav
  nav_home: string
  nav_upload: string
  nav_settings: string
  nav_results: string
  nav_graph: string
  nav_compare: string
  nav_dark_mode: string
  nav_light_mode: string
  nav_language: string
  // Compare page
  compare_title: string
  compare_select_analyses: string
  compare_analysis_a: string
  compare_analysis_b: string
  compare_select_both: string
  compare_configuration: string
  compare_climatic_params: string
  compare_genetic_params: string
  // Results page
  results_title: string
  results_analysis_runs: string
  results_no_results: string
  results_loading: string
  results_loading_trees: string
  results_climatic_trees: string
  results_genetic_trees: string
  results_statistical_tests: string
  results_share: string
  results_share_desc: string
  results_copy_link: string
  results_link_copied: string
  results_output: string
  results_excel: string
  results_download_chart: string
  results_searchFilterByNamePlaceholder: string
  results_searchFilterByStatusComplete: string
  results_searchFilterByStatusPending: string
  results_searchFilterByStatusFailed: string
  results_searchFilterByStatusAll: string
  results_searchFilterModeName: string
  results_searchFilterModeStatus: string
  results_searchFilterModeDate: string
  results_created : string
  results_expired : string
  // Climate chart builder
  chart_data_preview: string
  chart_hide: string
  chart_show: string
  chart_generate: string
  chart_x_axis: string
  chart_y_axis: string
  chart_type: string
  chart_bar: string
  chart_scatter: string
  chart_line: string
  chart_pie: string
  chart_select_columns: string
  chart_download: string
  // Phylo tree
  tree_download: string
  // Graph page
  graph_title: string
  graph_result: string
  graph_layout: string
  graph_no_trees: string
  graph_trees_tab: string
  graph_pipeline_tab: string
  // Loading / email notification
  loading_notify_prompt: string
  loading_notify_sent: string
  // Home page
  home_description_before: string
  home_phylogeographic: string
  home_description_after: string
  home_get_started: string
  // Upload page
  upload_title: string
  upload_input_files: string
  upload_climate_label: string
  upload_genetic_label: string
  upload_run: string
  upload_climatic_preview: string
  upload_genetic_preview: string
  upload_how_it_works: string
  upload_help_climate_title: string
  upload_help_climate_text: string
  upload_help_genetic_title: string
  upload_help_genetic_text: string
  upload_uploading: string
  upload_drop_text: string
  upload_browse: string
  upload_accepted: string
  upload_status_pending: string
  upload_status_climatic_trees: string
  upload_status_alignment: string
  upload_status_genetic_trees: string
  upload_status_output: string
  upload_status_complete: string
  upload_status_error: string
  upload_starting_pipeline: string
  // Settings page
  settings_title: string
  settings_analysis_params: string
  settings_bootstrap: string
  settings_window_size: string
  settings_step_size: string
  settings_dist_threshold: string
  settings_rate_similarity: string
  settings_permutations: string
  settings_methods: string
  settings_alignment_method: string
  settings_distance_method: string
  settings_fit_method: string
  settings_tree_type: string
  settings_similarity_method: string
  settings_statistical_test: string
  settings_mantel_method: string
  settings_preprocessing: string
  settings_genetic_preprocessing: string
  settings_climatic_preprocessing: string
  settings_climatic_correlation: string
  settings_correlation_threshold: string
  settings_save_section: string
  settings_save_btn: string
  settings_saving: string
  settings_saved: string
  settings_param_guide: string
  settings_disabled: string
  settings_enabled: string
  settings_help_bootstrap: string
  settings_help_window: string
  settings_help_distance: string
  settings_reset_section: string
  settings_reset_btn: string
  settings_reset_confirm_title: string
  settings_reset_confirm_message: string
  settings_reset_confirm_yes: string
  settings_reset_confirm_no: string
  settings_reset_success: string
  // Upload page additions
  upload_analysis_name: string
  upload_name_taken: string
  upload_settings_section: string
  upload_settings_show: string
  upload_settings_hide: string
  // Results page additions
  results_delete: string
  results_view_config: string
  results_edit_config: string
  results_rerun: string
  results_rerunning: string
  results_config_cancel: string
  // Errors Settings
  error_window_size: string
  error_step_size: string
  error_rate_similarity: string
  error_permutations_protest: string
  error_bootstrap_threshold: string
  error_dist_threshold: string
  error_correlation_threshold: string
  // Shared
  btn_download: string
  btn_send: string
}

const translations: Record<Lang, Translations> = {
  en: {
    nav_home: 'Home',
    nav_upload: 'Upload',
    nav_settings: 'Settings',
    nav_results: 'Results',
    nav_graph: 'Graph View',
    nav_compare: 'Compare',
    nav_dark_mode: 'Dark mode',
    nav_light_mode: 'Light mode',
    nav_language: 'Language',
    compare_title: 'Compare Analyses',
    compare_select_analyses: 'Select Analyses',
    compare_analysis_a: 'Analysis A',
    compare_analysis_b: 'Analysis B',
    compare_select_both: 'Select two completed analyses to compare.',
    compare_configuration: 'Configuration',
    compare_climatic_params: 'Climatic Parameters',
    compare_genetic_params: 'Genetic Parameters',
    results_title: 'Results',
    results_analysis_runs: 'Analysis Runs',
    results_no_results: 'No results yet. Upload files and run an analysis first.',
    results_loading: 'Loading…',
    results_loading_trees: 'Fetching tree data…',
    results_climatic_trees: 'Climatic Trees',
    results_genetic_trees: 'Genetic Trees',
    results_statistical_tests: 'Statistical Tests',
    results_share: 'Share Results',
    results_share_desc: 'Send a copy of these results to your email:',
    results_copy_link: 'Copy link',
    results_link_copied: 'Link copied!',
    results_output: 'Output',
    results_excel: 'Excel',
    results_download_chart: 'Download chart',
    results_searchFilterByNamePlaceholder: "Filter by name…",
    results_searchFilterByStatusComplete: "Complete",
    results_searchFilterByStatusPending: "Pending",
    results_searchFilterByStatusFailed: "Failed",
    results_searchFilterByStatusAll: "All statuses",
    results_searchFilterModeName: "Name",
    results_searchFilterModeStatus: "Status",
    results_searchFilterModeDate: "Date",
    results_created: "Created on",
    results_expired: "Expires on",
    chart_data_preview: 'Data Preview',
    chart_hide: '▲ Hide',
    chart_show: '▼ Show',
    chart_generate: 'Generate your graph',
    chart_x_axis: 'X axis data',
    chart_y_axis: 'Y axis data',
    chart_type: 'Chart type',
    chart_bar: 'Bar graph',
    chart_scatter: 'Scatter plot',
    chart_line: 'Line plot',
    chart_pie: 'Pie chart',
    chart_select_columns: 'Select X and Y columns to generate the chart.',
    chart_download: 'Download chart',
    tree_download: 'Download SVG',
    graph_title: 'Graph View',
    graph_result: 'Result',
    graph_layout: 'Layout',
    graph_no_trees: 'No tree data available for this result.',
    graph_trees_tab: 'Phylogenetic Trees',
    graph_pipeline_tab: 'App Graph',
    loading_notify_prompt: 'Get notified by email when your results are ready?',
    loading_notify_sent: "We'll email you at",
    home_description_before: 'An interactive platform for ',
    home_phylogeographic: 'phylogeographic analysis',
    home_description_after: ' — correlating genetic sequences with climatic and geographic data.',
    home_get_started: 'Get Started →',
    upload_title: 'Upload Data',
    upload_input_files: 'Input Files',
    upload_climate_label: 'Climate Data (CSV / Excel)',
    upload_genetic_label: 'Genetic Sequences (FASTA)',
    upload_run: 'Run Analysis →',
    upload_climatic_preview: 'Climatic Data Preview',
    upload_genetic_preview: 'Genetic Sequences Preview',
    upload_how_it_works: 'How it works',
    upload_help_climate_title: 'Climate Data',
    upload_help_climate_text: 'Upload a CSV or Excel file where each row corresponds to a sample location. Required columns: name, latitude, longitude, and any climate variables (e.g. temperature, precipitation).',
    upload_help_genetic_title: 'Genetic Sequences',
    upload_help_genetic_text: 'Upload a FASTA file with aligned sequences. Sample names must match those in the climate file.',
    upload_uploading: 'Uploading…',
    upload_drop_text: 'Drag & drop or',
    upload_browse: 'browse',
    upload_accepted: 'Accepted:',
    upload_status_pending: 'Queued…',
    upload_status_climatic_trees: 'Building climatic trees…',
    upload_status_alignment: 'Aligning sequences…',
    upload_status_genetic_trees: 'Building genetic trees…',
    upload_status_output: 'Computing output…',
    upload_status_complete: 'Complete!',
    upload_status_error: 'Error',
    upload_starting_pipeline: 'Starting pipeline…',
    settings_title: 'Settings',
    settings_analysis_params: 'Analysis Parameters',
    settings_bootstrap: 'Bootstrap Threshold',
    settings_window_size: 'Window Size',
    settings_step_size: 'Step Size',
    settings_dist_threshold: 'Distance Threshold',
    settings_rate_similarity: 'Rate Similarity (%)',
    settings_permutations: 'Permutations (Mantel / Protest)',
    settings_methods: 'Methods',
    settings_alignment_method: 'Alignment Method',
    settings_distance_method: 'Distance Method',
    settings_fit_method: 'Fit Method',
    settings_tree_type: 'Tree Type',
    settings_similarity_method: 'Similarity Method',
    settings_statistical_test: 'Statistical Test',
    settings_mantel_method: 'Mantel Test Method',
    settings_preprocessing: 'Preprocessing',
    settings_genetic_preprocessing: 'Genetic Preprocessing',
    settings_climatic_preprocessing: 'Climatic Preprocessing',
    settings_climatic_correlation: 'Climatic Correlation',
    settings_correlation_threshold: 'Correlation Threshold',
    settings_save_section: 'Save',
    settings_save_btn: 'Save Settings',
    settings_saving: 'Saving…',
    settings_saved: 'Settings saved.',
    settings_param_guide: 'Parameter Guide',
    settings_disabled: 'Disabled',
    settings_enabled: 'Enabled',
    settings_help_bootstrap: 'Minimum bootstrap support value to retain a branch. Typical values: 10–70.',
    settings_help_window: 'Sliding-window parameters for the sequence analysis. Smaller windows give finer resolution; larger steps speed up computation.',
    settings_help_distance: 'Maximum Robinson-Foulds distance to consider two trees similar.',
    settings_reset_section: 'Reset',
    settings_reset_btn: 'Reset to Defaults',
    settings_reset_confirm_title: 'Reset Settings',
    settings_reset_confirm_message: 'Are you sure you want to restore all settings to factory defaults? This action cannot be undone.',
    settings_reset_confirm_yes: 'Reset',
    settings_reset_confirm_no: 'Cancel',
    settings_reset_success: 'Settings restored to defaults.',
    upload_analysis_name: 'Analysis name',
    upload_name_taken: 'A result with this name already exists',
    upload_settings_section: 'Analysis Settings',
    upload_settings_show: 'Configure Settings ▼',
    upload_settings_hide: 'Hide Settings ▲',
    results_delete: 'Delete',
    results_view_config: 'View Configuration',
    results_edit_config: 'Edit Configuration',
    results_rerun: 'Re-run with new settings',
    results_rerunning: 'Re-running…',
    results_config_cancel: 'Cancel',
    btn_download: 'Download',
    btn_send: 'Send',
    error_window_size: "Window size must be a positive number (> 0).",
    error_step_size: "Step size must be a positive number (> 0).",
    error_rate_similarity: "Rate similarity must be a non-negative number (>= 0).",
    error_permutations_protest: "Number of permutations for PROTEST must be a non-negative number (>= 0).",
    error_bootstrap_threshold: "Bootstrap threshold must be a non-negative number (>= 0).",
    error_dist_threshold: "Distance threshold must be a non-negative number (>= 0).",
    error_correlation_threshold: "Correlation threshold must be between 0 and 1.",
  },
  fr: {
    nav_home: 'Accueil',
    nav_upload: 'Importer',
    nav_settings: 'Paramètres',
    nav_results: 'Résultats',
    nav_graph: 'Vue graphique',
    nav_compare: 'Comparer',
    nav_dark_mode: 'Mode sombre',
    nav_light_mode: 'Mode clair',
    nav_language: 'Langue',
    compare_title: 'Comparer les analyses',
    compare_select_analyses: 'Sélectionner les analyses',
    compare_analysis_a: 'Analyse A',
    compare_analysis_b: 'Analyse B',
    compare_select_both: 'Sélectionnez deux analyses terminées pour les comparer.',
    compare_configuration: 'Configuration',
    compare_climatic_params: 'Paramètres climatiques',
    compare_genetic_params: 'Paramètres génétiques',
    results_title: 'Résultats',
    results_analysis_runs: 'Analyses effectuées',
    results_no_results: "Aucun résultat pour l'instant. Importez des fichiers et lancez une analyse.",
    results_loading: 'Chargement…',
    results_loading_trees: "Récupération des données d'arbre…",
    results_climatic_trees: 'Arbres climatiques',
    results_genetic_trees: 'Arbres génétiques',
    results_statistical_tests: 'Tests statistiques',
    results_share: 'Partager les résultats',
    results_share_desc: 'Envoyer une copie de ces résultats à votre courriel :',
    results_copy_link: 'Copier le lien',
    results_link_copied: 'Lien copié !',
    results_output: 'Sortie',
    results_excel: 'Excel',
    results_download_chart: 'Télécharger le graphique',
    results_searchFilterByNamePlaceholder: "Filtrer par nom…",
    results_searchFilterByStatusComplete: "Complété",
    results_searchFilterByStatusPending: "En attente",
    results_searchFilterByStatusFailed: "Échoué",
    results_searchFilterByStatusAll: "Tous les statuts",
    results_searchFilterModeName: "Nom",
    results_searchFilterModeStatus: "Statut",
    results_searchFilterModeDate: "Date",
    results_created: "Créé le",
    results_expired: "Expire le",
    chart_data_preview: 'Aperçu des données',
    chart_hide: '▲ Masquer',
    chart_show: '▼ Afficher',
    chart_generate: 'Générer votre graphique',
    chart_x_axis: 'Données axe X',
    chart_y_axis: 'Données axe Y',
    chart_type: 'Type de graphique',
    chart_bar: 'Histogramme',
    chart_scatter: 'Nuage de points',
    chart_line: 'Courbe',
    chart_pie: 'Camembert',
    chart_select_columns: 'Sélectionnez les colonnes X et Y pour générer le graphique.',
    chart_download: 'Télécharger le graphique',
    tree_download: 'Télécharger SVG',
    graph_title: 'Vue graphique',
    graph_result: 'Résultat',
    graph_layout: 'Disposition',
    graph_no_trees: "Aucune donnée d'arbre disponible pour ce résultat.",
    graph_trees_tab: 'Arbres phylogénétiques',
    graph_pipeline_tab: 'Graphe de l\'app',
    loading_notify_prompt: 'Recevoir un e-mail quand vos résultats sont prêts ?',
    loading_notify_sent: 'Nous vous enverrons un e-mail à',
    home_description_before: "Une plateforme interactive d'",
    home_phylogeographic: 'analyse phylogéographique',
    home_description_after: ' — corrélant les séquences génétiques avec les données climatiques et géographiques.',
    home_get_started: 'Commencer →',
    upload_title: 'Importer les données',
    upload_input_files: "Fichiers d'entrée",
    upload_climate_label: 'Données climatiques (CSV / Excel)',
    upload_genetic_label: 'Séquences génétiques (FASTA)',
    upload_run: "Lancer l'analyse →",
    upload_climatic_preview: 'Aperçu des données climatiques',
    upload_genetic_preview: 'Aperçu des séquences génétiques',
    upload_how_it_works: 'Comment ça marche',
    upload_help_climate_title: 'Données climatiques',
    upload_help_climate_text: "Importez un fichier CSV ou Excel où chaque ligne correspond à un lieu d'échantillonnage. Colonnes requises : name, latitude, longitude, et toute variable climatique (par exemple température, précipitations).",
    upload_help_genetic_title: 'Séquences génétiques',
    upload_help_genetic_text: 'Importez un fichier FASTA avec des séquences alignées. Les noms des échantillons doivent correspondre à ceux du fichier climatique.',
    upload_uploading: 'Téléchargement…',
    upload_drop_text: 'Glissez-déposez ou',
    upload_browse: 'parcourir',
    upload_accepted: 'Accepté :',
    upload_status_pending: 'En attente…',
    upload_status_climatic_trees: 'Construction des arbres climatiques…',
    upload_status_alignment: 'Alignement des séquences…',
    upload_status_genetic_trees: 'Construction des arbres génétiques…',
    upload_status_output: 'Calcul des résultats…',
    upload_status_complete: 'Terminé !',
    upload_status_error: 'Erreur',
    upload_starting_pipeline: 'Démarrage du pipeline…',
    settings_title: 'Paramètres',
    settings_analysis_params: "Paramètres d'analyse",
    settings_bootstrap: 'Seuil de bootstrap',
    settings_window_size: 'Taille de fenêtre',
    settings_step_size: 'Pas de fenêtre',
    settings_dist_threshold: 'Seuil de distance',
    settings_rate_similarity: 'Taux de similarité (%)',
    settings_permutations: 'Permutations (Mantel / Protest)',
    settings_methods: 'Méthodes',
    settings_alignment_method: "Méthode d'alignement",
    settings_distance_method: 'Méthode de distance',
    settings_fit_method: "Méthode d'ajustement",
    settings_tree_type: "Type d'arbre",
    settings_similarity_method: 'Méthode de similarité',
    settings_statistical_test: 'Test statistique',
    settings_mantel_method: 'Méthode du test de Mantel',
    settings_preprocessing: 'Prétraitement',
    settings_genetic_preprocessing: 'Prétraitement génétique',
    settings_climatic_preprocessing: 'Prétraitement climatique',
    settings_climatic_correlation: 'Corrélation climatique',
    settings_correlation_threshold: 'Seuil de corrélation',
    settings_save_section: 'Enregistrer',
    settings_save_btn: 'Enregistrer les paramètres',
    settings_saving: 'Enregistrement…',
    settings_saved: 'Paramètres enregistrés.',
    settings_param_guide: 'Guide des paramètres',
    settings_disabled: 'Désactivé',
    settings_enabled: 'Activé',
    settings_help_bootstrap: 'Valeur minimale de support bootstrap pour conserver une branche. Valeurs typiques : 10–70.',
    settings_help_window: "Paramètres de fenêtre glissante pour l'analyse des séquences. Des fenêtres plus petites donnent une résolution plus fine ; des pas plus grands accélèrent le calcul.",
    settings_help_distance: 'Distance maximale de Robinson-Foulds pour considérer deux arbres similaires.',
    settings_reset_section: 'Réinitialiser',
    settings_reset_btn: 'Réinitialiser aux valeurs par défaut',
    settings_reset_confirm_title: 'Réinitialiser les paramètres',
    settings_reset_confirm_message: 'Êtes-vous sûr de vouloir restaurer tous les paramètres aux valeurs par défaut ? Cette action ne peut pas être annulée.',
    settings_reset_confirm_yes: 'Réinitialiser',
    settings_reset_confirm_no: 'Annuler',
    settings_reset_success: 'Paramètres restaurés aux valeurs par défaut.',
    upload_analysis_name: "Nom de l'analyse",
    upload_name_taken: 'Un résultat avec ce nom existe déjà',
    upload_settings_section: "Paramètres d'analyse",
    upload_settings_show: 'Configurer les paramètres ▼',
    upload_settings_hide: 'Masquer les paramètres ▲',
    results_delete: 'Supprimer',
    results_view_config: 'Voir la configuration',
    results_edit_config: 'Modifier la configuration',
    results_rerun: 'Relancer avec de nouveaux paramètres',
    results_rerunning: 'Relancement…',
    results_config_cancel: 'Annuler',
    btn_download: 'Télécharger',
    btn_send: 'Envoyer',
    error_window_size: "La taille de la fenêtre doit être un nombre strictement positif (> 0).",
    error_step_size: "Le pas de la fenêtre doit être un nombre strictement positif (> 0).",
    error_rate_similarity: "Le taux de similarité doit être un nombre positif ou nul (>= 0).",
    error_permutations_protest: "Le nombre de permutations pour PROTEST doit être un nombre positif ou nul (>= 0).",
    error_bootstrap_threshold: "Le seuil de bootstrap doit être un nombre positif ou nul (>= 0).",
    error_dist_threshold: "Le seuil de distance doit être un nombre positif ou nul (>= 0).",
    error_correlation_threshold: "Le seuil de corrélation doit être compris entre 0 et 1.",
  },
  es: {
    nav_home: 'Inicio',
    nav_upload: 'Cargar',
    nav_settings: 'Ajustes',
    nav_results: 'Resultados',
    nav_graph: 'Vista de grafo',
    nav_compare: 'Comparar',
    nav_dark_mode: 'Modo oscuro',
    nav_light_mode: 'Modo claro',
    nav_language: 'Idioma',
    compare_title: 'Comparar análisis',
    compare_select_analyses: 'Seleccionar análisis',
    compare_analysis_a: 'Análisis A',
    compare_analysis_b: 'Análisis B',
    compare_select_both: 'Selecciona dos análisis completados para compararlos.',
    compare_configuration: 'Configuración',
    compare_climatic_params: 'Parámetros climáticos',
    compare_genetic_params: 'Parámetros genéticos',
    results_title: 'Resultados',
    results_analysis_runs: 'Análisis realizados',
    results_no_results: 'Sin resultados aún. Sube archivos y ejecuta un análisis primero.',
    results_loading: 'Cargando…',
    results_loading_trees: 'Obteniendo datos del árbol…',
    results_climatic_trees: 'Árboles climáticos',
    results_genetic_trees: 'Árboles genéticos',
    results_statistical_tests: 'Pruebas estadísticas',
    results_share: 'Compartir resultados',
    results_share_desc: 'Enviar una copia de estos resultados a tu correo:',
    results_copy_link: 'Copiar enlace',
    results_link_copied: '¡Enlace copiado!',
    results_output: 'Salida',
    results_excel: 'Excel',
    results_download_chart: 'Descargar gráfico',
    results_searchFilterByNamePlaceholder: "Filtrar por nombre…",
    results_searchFilterByStatusComplete: "Completado",
    results_searchFilterByStatusPending: "Pendiente",
    results_searchFilterByStatusFailed: "Fallido",  
    results_searchFilterByStatusAll: "Todos los estados",
    results_searchFilterModeName: "Nombre",
    results_searchFilterModeStatus: "Estado",
    results_searchFilterModeDate: "Fecha",
    results_created: "Creado el",
    results_expired: "Expira el",
    chart_data_preview: 'Vista previa de datos',
    chart_hide: '▲ Ocultar',
    chart_show: '▼ Mostrar',
    chart_generate: 'Genera tu gráfico',
    chart_x_axis: 'Datos eje X',
    chart_y_axis: 'Datos eje Y',
    chart_type: 'Tipo de gráfico',
    chart_bar: 'Gráfico de barras',
    chart_scatter: 'Diagrama de dispersión',
    chart_line: 'Gráfico de líneas',
    chart_pie: 'Gráfico circular',
    chart_select_columns: 'Selecciona las columnas X e Y para generar el gráfico.',
    chart_download: 'Descargar gráfico',
    tree_download: 'Descargar SVG',
    graph_title: 'Vista de grafo',
    graph_result: 'Resultado',
    graph_layout: 'Disposición',
    graph_no_trees: 'No hay datos de árbol disponibles para este resultado.',
    graph_trees_tab: 'Árboles filogenéticos',
    graph_pipeline_tab: 'Grafo de la app',
    loading_notify_prompt: '¿Recibir un correo cuando tus resultados estén listos?',
    loading_notify_sent: 'Te enviaremos un correo a',
    home_description_before: 'Una plataforma interactiva para el ',
    home_phylogeographic: 'análisis filogeográfico',
    home_description_after: ' — correlacionando secuencias genéticas con datos climáticos y geográficos.',
    home_get_started: 'Comenzar →',
    upload_title: 'Cargar datos',
    upload_input_files: 'Archivos de entrada',
    upload_climate_label: 'Datos climáticos (CSV / Excel)',
    upload_genetic_label: 'Secuencias genéticas (FASTA)',
    upload_run: 'Ejecutar análisis →',
    upload_climatic_preview: 'Vista previa de datos climáticos',
    upload_genetic_preview: 'Vista previa de secuencias genéticas',
    upload_how_it_works: 'Cómo funciona',
    upload_help_climate_title: 'Datos climáticos',
    upload_help_climate_text: 'Sube un archivo CSV o Excel donde cada fila corresponde a una ubicación de muestra. Columnas requeridas: name, latitude, longitude y cualquier variable climática (por ejemplo, temperatura, precipitación).',
    upload_help_genetic_title: 'Secuencias genéticas',
    upload_help_genetic_text: 'Sube un archivo FASTA con secuencias alineadas. Los nombres de las muestras deben coincidir con los del archivo climático.',
    upload_uploading: 'Cargando…',
    upload_drop_text: 'Arrastra y suelta o',
    upload_browse: 'buscar',
    upload_accepted: 'Aceptado:',
    upload_status_pending: 'En cola…',
    upload_status_climatic_trees: 'Construyendo árboles climáticos…',
    upload_status_alignment: 'Alineando secuencias…',
    upload_status_genetic_trees: 'Construyendo árboles genéticos…',
    upload_status_output: 'Calculando resultados…',
    upload_status_complete: '¡Completado!',
    upload_status_error: 'Error',
    upload_starting_pipeline: 'Iniciando pipeline…',
    settings_title: 'Ajustes',
    settings_analysis_params: 'Parámetros de análisis',
    settings_bootstrap: 'Umbral de bootstrap',
    settings_window_size: 'Tamaño de ventana',
    settings_step_size: 'Tamaño de paso',
    settings_dist_threshold: 'Umbral de distancia',
    settings_rate_similarity: 'Tasa de similitud (%)',
    settings_permutations: 'Permutaciones (Mantel / Protest)',
    settings_methods: 'Métodos',
    settings_alignment_method: 'Método de alineamiento',
    settings_distance_method: 'Método de distancia',
    settings_fit_method: 'Método de ajuste',
    settings_tree_type: 'Tipo de árbol',
    settings_similarity_method: 'Método de similitud',
    settings_statistical_test: 'Prueba estadística',
    settings_mantel_method: 'Método de prueba de Mantel',
    settings_preprocessing: 'Preprocesamiento',
    settings_genetic_preprocessing: 'Preprocesamiento genético',
    settings_climatic_preprocessing: 'Preprocesamiento climático',
    settings_climatic_correlation: 'Correlación climática',
    settings_correlation_threshold: 'Umbral de correlación',
    settings_save_section: 'Guardar',
    settings_save_btn: 'Guardar ajustes',
    settings_saving: 'Guardando…',
    settings_saved: 'Ajustes guardados.',
    settings_param_guide: 'Guía de parámetros',
    settings_disabled: 'Desactivado',
    settings_enabled: 'Activado',
    settings_help_bootstrap: 'Valor mínimo de soporte bootstrap para conservar una rama. Valores típicos: 10–70.',
    settings_help_window: 'Parámetros de ventana deslizante para el análisis de secuencias. Ventanas más pequeñas dan mayor resolución; pasos más grandes aceleran el cálculo.',
    settings_help_distance: 'Distancia máxima de Robinson-Foulds para considerar dos árboles similares.',
    settings_reset_section: 'Restaurar',
    settings_reset_btn: 'Restaurar valores por defecto',
    settings_reset_confirm_title: 'Restaurar ajustes',
    settings_reset_confirm_message: '¿Estás seguro de que quieres restaurar todos los ajustes a los valores por defecto? Esta acción no se puede deshacer.',
    settings_reset_confirm_yes: 'Restaurar',
    settings_reset_confirm_no: 'Cancelar',
    settings_reset_success: 'Ajustes restaurados a los valores por defecto.',
    upload_analysis_name: 'Nombre del análisis',
    upload_name_taken: 'Ya existe un resultado con este nombre',
    upload_settings_section: 'Configuración del análisis',
    upload_settings_show: 'Configurar ajustes ▼',
    upload_settings_hide: 'Ocultar ajustes ▲',
    results_delete: 'Eliminar',
    results_view_config: 'Ver configuración',
    results_edit_config: 'Editar configuración',
    results_rerun: 'Re-ejecutar con nuevos ajustes',
    results_rerunning: 'Re-ejecutando…',
    results_config_cancel: 'Cancelar',
    btn_download: 'Descargar',
    btn_send: 'Enviar',
    error_window_size: "El tamaño de la ventana debe ser un número positivo (> 0).",
    error_step_size: "El tamaño del paso debe ser un número positivo (> 0).",
    error_rate_similarity: "La tasa de similitud debe ser un número no negativo (>= 0).",
    error_permutations_protest: "El número de permutaciones para PROTEST debe ser un número no negativo (>= 0).",
    error_bootstrap_threshold: "El umbral de bootstrap debe ser un número no negativo (>= 0).",
    error_dist_threshold: "El umbral de distancia debe ser un número no negativo (>= 0).",
    error_correlation_threshold: "El umbral de correlación debe estar entre 0 y 1.",
  },
}

interface LanguageContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => { },
  t: translations.en,
})

/**
 * Provides the active language and its translation table, persisted to
 * `localStorage` under `iphylogeo-lang`. Add a new string by adding the key to
 * {@link Translations} and a value in all three `translations` entries below —
 * TypeScript will error on any locale missing a key.
 */

/**
 * Helper to determine the initial language based on local storage and browser locale.
 */
function getInitialLanguage(): Lang {
  //Check local storage override first
  const savedLang = localStorage.getItem('iphylogeo-lang') as Lang | null
  if (savedLang && (savedLang === 'en' || savedLang === 'fr' || savedLang === 'es')) {
    return savedLang
  }

  //Read browser locale (e.g., "fr-FR" -> "fr")
  const browserLang = navigator.language.split('-')[0] as Lang

  if (browserLang === 'en' || browserLang === 'fr' || browserLang === 'es') {
    return browserLang
  }

  //Default fallback
  return 'fr'
}

/**
 * Provides the active language and its translation table, persisted to
 * `localStorage` under `iphylogeo-lang`. Auto-detects browser language on first visit.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLanguage)

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('iphylogeo-lang', l)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

/** Access the current language, setter, and translation strings (`t`). Must be used under `<LanguageProvider>`. */
export const useLang = () => useContext(LanguageContext)
