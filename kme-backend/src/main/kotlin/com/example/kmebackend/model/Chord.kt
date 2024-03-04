package com.example.kmebackend.model

import jakarta.persistence.*

@Entity
data class Chord(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @OneToOne(optional = false, mappedBy = "chord")
    val groupingEntry: GroupingEntry? = null,
    @OneToOne(optional = false, mappedBy = "chord")
    val stem: Stem? = null,
    @OneToMany(mappedBy = "chord")
    val notes: List<Note> = emptyList(),
    val metadata: String? = null,
)
