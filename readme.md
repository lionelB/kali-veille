# Kali-veille
Exploration de l'api DILA legifrance pour assurer la veille de contenus


## Notes:
- Lorsqu'on récupère un container de ccn, les sections contenant les "Textes Attachés" ou les "Textes Salaires" on une dateModif qui permettrai de déclenché la récupération du texte. Attention cette date n'est pas toujours pertinente, il vaut mieux se baser sur `lstLienModification`

- Sur les textes (KALITEXT000005689370), on peut récupérer le `lstLienModification` des articles qui permet d'avoir la liste des modification apporté aux articles en vigueur. Certaines les dates sont arbitraire (ex: 2999-01-01)

