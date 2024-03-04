package com.example.kmebackend.model

import jakarta.persistence.*

@Entity
data class Grouping(
    @Id
    @ManyToOne
    val voice: Voice? = null,
    @Id
    @Column(name = "groupings_order")
    val groupingsOrder: Long? = null,
    @OneToMany(mappedBy = "grouping")
    @OrderColumn(name = "grouping_entries_order")
    val groupingEntries: List<GroupingEntry> = emptyList(),
    val metadata: String? = null,
)
