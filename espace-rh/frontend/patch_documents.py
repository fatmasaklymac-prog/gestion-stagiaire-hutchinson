import re

path = "src/pages/Documents.jsx"
with open(path, "r") as f:
    content = f.read()

replacements = []

# 1. Import React Fragment
old = 'import { useState, useEffect } from "react";'
new = 'import { useState, useEffect, Fragment } from "react";'
replacements.append((old, new))

# 2. Import expand icons
old = 'import CloseIcon from "@mui/icons-material/Close";'
new = '''import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";'''
replacements.append((old, new))

# 3. State for expanded row
old = '  const [filtersOpen, setFiltersOpen] = useState(false);'
new = '''  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expandedStagiaire, setExpandedStagiaire] = useState(null);'''
replacements.append((old, new))

# 4. Grouping logic after filteredDocuments block
old = '''  // ─── Render ───
  return ('''
new = '''  // ─── Regroupement par stagiaire (une seule ligne par stagiaire) ───
  const documentsParStagiaire = {};
  filteredDocuments.forEach((doc) => {
    if (!documentsParStagiaire[doc.stagiaire_id]) {
      documentsParStagiaire[doc.stagiaire_id] = [];
    }
    documentsParStagiaire[doc.stagiaire_id].push(doc);
  });
  const lignesStagiaires = Object.keys(documentsParStagiaire).map((id) => {
    const docs = documentsParStagiaire[id];
    const complet = docs.length > 0 && docs.every((d) => d.statut === "valide");
    return { stagiaire_id: Number(id), docs, complet };
  });

  const toggleExpand = (id) => {
    setExpandedStagiaire((prev) => (prev === id ? null : id));
  };

  // ─── Render ───
  return ('''
replacements.append((old, new))

# 5. Replace the whole Table block (header + body)
old_table_start = '''      {/* Tableau */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor: BORDER,
          overflow: "hidden",
          bgcolor: WHITE,
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#F8FAFC" }}>
              {["Stagiaire", "Type de document", "Date", "Statut", "Lien fichier"].map((h) => (
                <TableCell
                  key={h}
                  sx={{
                    fontWeight: 700,
                    color: PRIMARY,
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    borderBottom: "none",
                    py: 1.5,
                  }}
                >
                  {h}
                </TableCell>
              ))}
              <TableCell
                align="right"
                sx={{
                  fontWeight: 700,
                  color: PRIMARY,
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  borderBottom: "none",
                  py: 1.5,
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <DescriptionIcon sx={{ fontSize: 48, color: TEXT_LIGHT, mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    Aucun document trouvé
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((doc) => {
                const status = getStatusConfig(doc.statut);
                return (
                  <TableRow
                    key={doc.id}
                    hover
                    sx={{
                      transition: "all 0.2s ease",
                      "&:hover": { bgcolor: "#F8FAFC" },
                      "&:last-child td": { borderBottom: "none" },
                    }}
                  >
                    {/* Stagiaire */}
                    <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: getAvatarColor(doc.stagiaire_id),
                            width: 44,
                            height: 44,
                            fontSize: 15,
                            fontWeight: 700,
                          }}
                        >
                          {getStagiaireInitials(doc.stagiaire_id)}
                        </Avatar>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: TEXT }}>
                          {getStagiaireName(doc.stagiaire_id)}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Type */}
                    <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                      <Typography variant="body2" fontWeight={500} sx={{ color: TEXT, fontSize: "0.9rem" }}>
                        {doc.type_document}
                      </Typography>
                    </TableCell>

                    {/* Date */}
                    <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                      <Typography variant="body2" sx={{ color: TEXT, fontSize: "0.85rem" }}>
                        {doc.date_document
                          ? new Date(doc.date_document).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </Typography>
                    </TableCell>

                    {/* Statut */}
                    <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                      <Chip
                        label={status.label}
                        size="small"
                        sx={{
                          bgcolor: status.bg,
                          color: status.color,
                          fontWeight: 600,
                          borderRadius: 2,
                          fontSize: "0.8rem",
                          px: 0.5,
                        }}
                      />
                    </TableCell>

                    {/* Lien */}
                    <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                      {doc.fichier_url ? (
                        <Button
                          size="small"
                          startIcon={<LinkIcon />}
                          href={doc.fichier_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            color: PRIMARY,
                            fontSize: "0.8rem",
                            "&:hover": { bgcolor: BLUE_LIGHT },
                          }}
                        >
                          Voir
                        </Button>
                      ) : (
                        <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontSize: "0.85rem" }}>
                          —
                        </Typography>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right" sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                      {(doc.statut === "valide" || doc.statut === "refuse") ? (
                        <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontSize: "0.85rem" }}>
                          —
                        </Typography>
                      ) : (
                        <>
                          <Tooltip title="Modifier">
                            <IconButton
                              size="small"
                              onClick={() => ouvrirModification(doc)}
                              sx={{ color: PRIMARY }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(doc.id)}
                              sx={{ color: SECONDARY }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>'''

new_table = '''      {/* Tableau */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor: BORDER,
          overflow: "hidden",
          bgcolor: WHITE,
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#F8FAFC" }}>
              {["Stagiaire", "Nombre de documents", "Statut global"].map((h) => (
                <TableCell
                  key={h}
                  sx={{
                    fontWeight: 700,
                    color: PRIMARY,
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    borderBottom: "none",
                    py: 1.5,
                  }}
                >
                  {h}
                </TableCell>
              ))}
              <TableCell
                align="right"
                sx={{
                  fontWeight: 700,
                  color: PRIMARY,
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  borderBottom: "none",
                  py: 1.5,
                }}
              >
                Détails
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lignesStagiaires.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <DescriptionIcon sx={{ fontSize: 48, color: TEXT_LIGHT, mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    Aucun document trouvé
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              lignesStagiaires.map(({ stagiaire_id, docs, complet }) => {
                const isOpen = expandedStagiaire === stagiaire_id;
                return (
                  <Fragment key={stagiaire_id}>
                    <TableRow
                      hover
                      onClick={() => toggleExpand(stagiaire_id)}
                      sx={{
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        "&:hover": { bgcolor: "#F8FAFC" },
                        "& td": { borderBottom: isOpen ? "none" : "1px solid #f1f5f9" },
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: getAvatarColor(stagiaire_id),
                              width: 44,
                              height: 44,
                              fontSize: 15,
                              fontWeight: 700,
                            }}
                          >
                            {getStagiaireInitials(stagiaire_id)}
                          </Avatar>
                          <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: TEXT }}>
                            {getStagiaireName(stagiaire_id)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" sx={{ color: TEXT, fontSize: "0.9rem" }}>
                          {docs.length} document{docs.length > 1 ? "s" : ""}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          label={complet ? "Complet" : "Incomplet"}
                          size="small"
                          sx={{
                            bgcolor: complet ? GREEN_LIGHT : ORANGE_LIGHT,
                            color: complet ? SUCCESS : WARNING,
                            fontWeight: 600,
                            borderRadius: 2,
                            fontSize: "0.8rem",
                            px: 0.5,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ py: 2 }}>
                        <IconButton size="small" sx={{ color: PRIMARY }}>
                          {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} sx={{ p: 0, borderBottom: isOpen ? "1px solid #f1f5f9" : "none" }}>
                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                          <Box sx={{ bgcolor: "#FAFBFD", px: 3, py: 2 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  {["Type de document", "Date", "Statut", "Lien fichier", "Actions"].map((h) => (
                                    <TableCell
                                      key={h}
                                      sx={{
                                        fontWeight: 700,
                                        color: TEXT_LIGHT,
                                        fontSize: "0.65rem",
                                        textTransform: "uppercase",
                                        letterSpacing: 0.5,
                                        borderBottom: "1px solid #e5e7eb",
                                      }}
                                    >
                                      {h}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {docs.map((doc) => {
                                  const status = getStatusConfig(doc.statut);
                                  return (
                                    <TableRow key={doc.id}>
                                      <TableCell sx={{ borderBottom: "1px solid #f1f5f9" }}>
                                        <Typography variant="body2" fontWeight={500} sx={{ color: TEXT, fontSize: "0.85rem" }}>
                                          {doc.type_document}
                                        </Typography>
                                      </TableCell>
                                      <TableCell sx={{ borderBottom: "1px solid #f1f5f9" }}>
                                        <Typography variant="body2" sx={{ color: TEXT, fontSize: "0.8rem" }}>
                                          {doc.date_document
                                            ? new Date(doc.date_document).toLocaleDateString("fr-FR", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                              })
                                            : "—"}
                                        </Typography>
                                      </TableCell>
                                      <TableCell sx={{ borderBottom: "1px solid #f1f5f9" }}>
                                        <Chip
                                          label={status.label}
                                          size="small"
                                          sx={{
                                            bgcolor: status.bg,
                                            color: status.color,
                                            fontWeight: 600,
                                            borderRadius: 2,
                                            fontSize: "0.75rem",
                                            px: 0.5,
                                          }}
                                        />
                                      </TableCell>
                                      <TableCell sx={{ borderBottom: "1px solid #f1f5f9" }}>
                                        {doc.fichier_url ? (
                                          <Button
                                            size="small"
                                            startIcon={<LinkIcon />}
                                            href={doc.fichier_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{
                                              textTransform: "none",
                                              fontWeight: 600,
                                              color: PRIMARY,
                                              fontSize: "0.75rem",
                                              "&:hover": { bgcolor: BLUE_LIGHT },
                                            }}
                                          >
                                            Voir
                                          </Button>
                                        ) : (
                                          <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontSize: "0.8rem" }}>
                                            —
                                          </Typography>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {(doc.statut === "valide" || doc.statut === "refuse") ? (
                                          <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontSize: "0.8rem" }}>
                                            —
                                          </Typography>
                                        ) : (
                                          <>
                                            <Tooltip title="Modifier">
                                              <IconButton
                                                size="small"
                                                onClick={(e) => { e.stopPropagation(); ouvrirModification(doc); }}
                                                sx={{ color: PRIMARY }}
                                              >
                                                <EditIcon fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Supprimer">
                                              <IconButton
                                                size="small"
                                                onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                                                sx={{ color: SECONDARY }}
                                              >
                                                <DeleteIcon fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                          </>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>'''

replacements.append((old_table_start, new_table))

missing = []
for old, new in replacements:
    if old not in content:
        missing.append(old[:80])
    else:
        content = content.replace(old, new)

if missing:
    print("MOTIFS NON TROUVÉS (vérifier manuellement) :")
    for m in missing:
        print(" -", m)
else:
    with open(path, "w") as f:
        f.write(content)
    print("Toutes les modifications ont été appliquées avec succès.")
