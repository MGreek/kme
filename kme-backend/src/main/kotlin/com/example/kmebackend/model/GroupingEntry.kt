package com.example.kmebackend.model

import jakarta.persistence.*
import jakarta.validation.constraints.AssertTrue

@Entity
data class GroupingEntry(
    @Id
    @ManyToOne
    val grouping: Grouping? = null,
    @Id
    @Column(name = "grouping_entries_order")
    val groupingEntriesOrder: Long? = null,
    @OneToOne(optional = true)
    val chord: Chord? = null,
    @OneToOne(optional = true)
    val rest: Rest? = null,
    val metadata: String? = null,
) {
    @AssertTrue
    private fun hasEntry() = (chord != null && rest == null) || (chord == null && rest != null)
}
