# DataPredict

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-green)
![Python](https://img.shields.io/badge/Python-3.9-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100-009688)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED)
![SonarQube](https://img.shields.io/badge/Quality-SonarQube-5196C2)

**DataPredict** est une plateforme de **Machine Learning Low-Code Distribuée** conçue pour démocratiser l'IA via une approche de **Guided AutoML**. Elle permet de transformer des données brutes en modèles prédictifs grâce à une orchestration hybride unique.

---

## Architecture du Système

DataPredict repose sur une architecture **Microservices Hybride** structurée selon le pattern **"Java Orchestrator – Python Worker"**.



### Orchestration Polyglotte
* **Orchestrateurs (Java Spring Boot)** : Gèrent la logique métier, la sécurité (JWT), les transactions et la persistance MySQL.
* **Workers (Scripts Python)** : Exécutés via `ProcessBuilder` pour l'analyse statistique et l'entraînement intensif.
* **Expert (FastAPI)** : Un service Python dédié à la recommandation d'algorithmes via API REST.


![Architecture](https://github.com/user-attachments/assets/0cc83e21-bc9e-41a0-b9dc-2b6e7a3f7c20)

---

## Fonctionnalités Clés

### Preprocessing & NLP

* **Analyse Automatique** : Détection intelligente des types de données, des valeurs manquantes et des distributions statistiques via Python.
* **Pipeline de nettoyage** : Application semi-automatisée de l'imputation (moyenne/médiane), de l'encodage et de la normalisation.

### Feature Selection (Scoring Hybride)

Évaluation de la pertinence des variables via une combinaison pondérée d'algorithmes (30% MI, 20% Pearson, 20% ANOVA, 30% RF) :

* **Statistiques** : Mutual Information, Pearson Correlation, ANOVA.
* **Avancés** : FCBF (Fast Correlation-Based Filter) et importance par Random Forest.

### Recommandation et Entraînement

* **Système Expert** : Recommandation de l'algorithme optimal (XGBoost, Random Forest, etc.) basée sur les caractéristiques du dataset.
* **Suivi Temps Réel** : Capture des métriques (Accuracy, F1, Log Loss) et envoi de notifications push via Firebase une fois l'entraînement terminé.

---

## Stack Technique

* **Backend** : Java 17 (Spring Boot 3, Spring Cloud Gateway), Python 3.9 (FastAPI).
* **Frontend** : React.js (Vite) & React Native (Expo) pour le suivi mobile.
* **Data** : MySQL (architecture une base par service), Scikit-learn, Pandas, NumPy.
* **DevOps** : Docker & Docker Compose, HashiCorp Consul, Jenkins, SonarQube.

---

## Installation et Lancement

### Prérequis

* Docker & Docker Compose
* Git

### Démarrage Rapide

1. **Cloner le projet** :
```bash
git clone [https://github.com/benmekkielmahdi/DataPredict.git](https://github.com/benmekkielmahdi/DataPredict.git)
cd DataPredict

```


2. **Lancer l'infrastructure complète** :
```bash
docker-compose up --build -d

```


3. **Accès aux services** :
* **Interface Web** : `http://localhost:3000`
* **API Gateway** : `http://localhost:8888`
* **Tableau de bord Consul** : `http://localhost:8500`



---

## Qualité et DevOps

Le projet suit des standards de qualité rigoureux via des **Quality Gates** SonarQube :

* **Couverture de code** : Seuil minimal de 80% requis.
* **Analyse Statique** : Respect du standard PEP8 pour Python et détection de code mort en Java.
* **Sécurité** : Validation systématique des tokens JWT et isolation des bases de données par service.

---

## Contributeurs

* **Anas KHAIY**
* **EL Mahdi BEN MEKKI**
* **Mohamed BOUIZERGUANE**

---

## Licence

Ce projet est sous licence **MIT**.

---

## Démonstration

